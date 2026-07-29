# Cloudflare-native analytics — final implementation plan

**Tracking:** [#286](https://github.com/sreetamdas/sreetamdas.com/issues/286) —
that issue carries the phased checklist; this document stays the source of
truth for detail.

**Status:** ready for implementation. Supersedes
`2026-07-17-cloudflare-native-analytics.md` (WAE-based) and the June
Queue-based design. This document is self-contained: everything needed to
implement the migration without access to prior conversations.

**Goal:** remove Plausible entirely (tracker, first-party proxies, Stats API
integration, subscription) and replace it with a small, exact, replayable
analytics system on Cloudflare primitives: **direct-to-D1 raw events → pure
session reducer → daily aggregates → the existing `/stats` UI**.

**Design synthesis** (from three prior iterations):

- ~~June design~~: D1 + Cloudflare Queues. Rejected: Queues are
  at-least-once, unordered, concurrently consumed — all that machinery
  (idempotency, DLQ, ordering policy, `max_concurrency`) buys nothing at this
  site's volume (thousands of events/day). D1 handles single-row inserts on
  the request path trivially.
- ~~July WAE design~~: beacon → Workers Analytics Engine → cron rollups → D1.
  Rejected: WAE's ~90-day retention and sampling mean history can never be
  recomputed if rollup logic changes, sessions are approximations over a
  lossy store, and reads require an account-scoped HTTP API token. Raw events
  in D1 make every derived table a pure, re-runnable function.
- **This design**: keep the July plan's tracker/rollup/read-path/backfill
  shape, but persist exact raw events in a dedicated D1 database and derive
  sessions with Plausible's documented semantics. No Queues, no Workflows, no
  WAE, no R2.

**Licensing guardrails:** Plausible's server is AGPLv3 — use it as a
behavioral spec only, never port/translate its Elixir code. Its browser
tracker is MIT (adaptation allowed with notice, but this plan specifies an
independent ~100-line tracker, so no code needs to be copied). Do not vendor
Plausible/Snowplow/GA4 referrer datasets (GPL/Google provenance) — this plan
ships a small hand-curated source map instead.

---

## 0. Repo context (read this first)

- Stack: TanStack Start (React 19) on Cloudflare Workers. Worker entry:
  `src/worker.ts` (exports `fetch` via `createServerEntry`, wrapped in
  `Sentry.withSentry`; also exports two Durable Objects). File-based routes
  under `src/routes/`, API routes use
  `createFileRoute("...")({ server: { handlers: { GET/POST } } })`.
- Server functions: `createServerFn` + `createServerOnlyFn` with dynamic
  `import()` of `*.server.ts` modules (see
  `src/lib/domains/foobar/cloud-progress.server.ts` for the house pattern).
- Existing app D1 (binding `D1`, drizzle-orm, schema `src/db/schema.ts`,
  config `.config/drizzle.config.ts`). **All three wrangler environments
  currently share one `database_id`** — analytics gets its own database per
  environment (§2).
- Prerendered HTML is served by Workers Assets + edge cache **before the
  Worker runs**, so pageviews must come from a client beacon, never from
  server-side request logging.
- `/stats` page: route `src/routes/(main)/stats/route.tsx`, server fn
  `src/routes/(main)/stats/-stats.server.ts` (`getStats`), UI
  `src/routes/(main)/-stats/components.tsx`, currently typed against
  `PlausibleStats` from `src/lib/domains/Plausible/shared.ts`. The page is
  edge-cached 60s (`STATS_CACHE_HEADERS` in `src/lib/cacheHeaders.ts`).
- Live-visitor counts already exist via `PresenceDurableObject` — untouched
  by this migration; label it "connected now" (it counts open sockets, not
  Plausible-style 5-minute visitors).
- Helpers to reuse: `getOrCreatePresenceClientId(storage, createId?, key?)`
  in `src/lib/domains/Presence/client-id.ts` (storage-safe random id);
  `isRealtimeClientId` in `src/lib/domains/realtime/client-id.ts`
  (`/^[A-Za-z0-9_-]{8,80}$/`).
- Commands (pnpm is via corepack; plain `pnpm` is NOT on PATH):

  ```sh
  export PATH="$HOME/.local/share/mise/installs/node/24.15.0/bin:$PATH"
  corepack pnpm exec vp test run --config .config/vitest.unit.config.ts   # unit
  corepack pnpm run test:workers                                          # workerd tests
  corepack pnpm run typecheck
  corepack pnpm exec vp lint ./src        # scripts/ is NOT linted (no-console ok there)
  corepack pnpm run cf-typegen            # regenerate src/cloudflare-env.d.ts
  ```

  Shell is fish: quote paths containing parentheses like
  `"src/routes/(api)/..."`.

### Current Plausible surface (complete inventory)

| Piece | Path |
| --- | --- |
| Script tag + inline queue stub | `src/routes/__root.tsx` (`scripts` in head config; `data-api` → event proxy) |
| Script proxy | `src/routes/(api)/prxy/plsbl/js/$script.ts` + `-script.test.ts` |
| Event proxy | `src/routes/(api)/prxy/plsbl/api/event.ts` + `-event.test.ts` |
| Client event hook | `src/lib/domains/Plausible/index.ts` (`useCustomPlausible`) |
| Stats API client | `src/lib/domains/Plausible/stats.ts`, `shared.ts`, `stats.test.ts` |
| Stats server fn | `src/routes/(main)/stats/-stats.server.ts` |
| Env | `PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID` (`.env.example`, worker secrets, `src/cloudflare-env.d.ts`) |

`useCustomPlausible` call sites (all fire `plausible("foobar", { props: { achievement } })`):
`src/lib/domains/foobar/Pixel.tsx` (konami, campfire, error404, navigator,
completed), `src/lib/domains/foobar/Entry.tsx` (unlocked),
`src/lib/domains/foobar/DashboardClient.tsx` (restart, page flags),
`src/lib/components/SocialLinks.tsx` (easter-egg),
`src/lib/components/Error.tsx` (dogs). The `revenue`/`u` options are unused.

---

## 1. Architecture

```
browser: inline tracker (~1KB, no external script, no cookies)
  └─ sendBeacon POST /api/pulse   { id, t, p, r, n?, props?, sid, utm? }
       └─ worker handler: validate (strict allowlists) → normalize
          (UA→browser/os/device, referrer→host/source/channel, cf→geo,
          HMAC daily visitor hash — raw IP/UA never stored)
          → INSERT OR IGNORE into ANALYTICS_DB.analytics_events

cron (hourly): for day in [today, yesterday]:
  rebuild analytics_sessions (pure reducer, Plausible semantics)
  upsert analytics_day + analytics_day_dim
  (daily) prune raw events older than 180 days

/stats: getStats server fn → fetchSiteStats(range) → reads aggregates only
```

Everything derived is recomputable from `analytics_events` — the reducer and
rollups are pure functions; recomputing a day is the idempotency mechanism.

---

## 2. New D1 database + wrangler config

One **new** D1 database per environment (do NOT reuse the app DB — the app DB
is shared across envs today and analytics writes are the highest-volume
writes in the system):

```sh
wrangler d1 create sreetamdas_analytics
wrangler d1 create sreetamdas_analytics_staging
```

`wrangler.jsonc` — top level and mirrored into each `env` (follow how
`d1_databases` is already duplicated; staging env binds the staging db):

```jsonc
"d1_databases": [
  { "binding": "D1", ... existing ... },
  { "binding": "ANALYTICS_DB", "database_name": "sreetamdas_analytics",
    "database_id": "<from create>", "migrations_dir": "drizzle-analytics" }
],
"triggers": { "crons": ["17 * * * *"] }
```

Then `corepack pnpm run cf-typegen`.

Drizzle: new schema file `src/db/analytics-schema.ts`, new config
`.config/drizzle.analytics.config.ts` (copy the existing config, point at the
new schema + `drizzle-analytics` out dir), and package scripts
`db:analytics:generate`, `db:analytics:migrate:local`,
`db:analytics:migrate:remote` mirroring the existing `db:*` scripts.

New secret: `ANALYTICS_SALT_SECRET` (long random string; `.env.example` +
`wrangler secret put` for prod and staging).

### Schema (`src/db/analytics-schema.ts`)

```ts
analyticsEvents = sqliteTable("analytics_events", {
  eventId: text("event_id").primaryKey(),          // client uuid — idempotency
  occurredAt: integer("occurred_at").notNull(),    // server ms epoch
  day: text("day").notNull(),                      // UTC YYYY-MM-DD of occurredAt
  type: text("type").notNull(),                    // "pageview" | "event"
  name: text("name").notNull().default(""),        // "" | "foobar"
  prop: text("prop").notNull().default(""),        // achievement value or ""
  path: text("path").notNull(),
  visitorHash: text("visitor_hash").notNull(),
  sessionId: text("session_id").notNull().default(""), // client per-tab id ("" for teed events)
  referrerHost: text("referrer_host").notNull().default(""),
  source: text("source").notNull().default(""),
  channel: text("channel").notNull().default(""),
  utmSource: text("utm_source").notNull().default(""),
  utmMedium: text("utm_medium").notNull().default(""),
  utmCampaign: text("utm_campaign").notNull().default(""),
  country: text("country").notNull().default(""),  // ISO code
  city: text("city").notNull().default(""),
  browser: text("browser").notNull().default(""),
  os: text("os").notNull().default(""),
  device: text("device").notNull().default(""),    // Desktop | Mobile | Tablet
}, (t) => [index("idx_events_day").on(t.day)]);    // ONE index — keep write amplification at 2 rows/event

analyticsSessions = sqliteTable("analytics_sessions", {
  sessionKey: text("session_key").primaryKey(),    // `${day}:${visitorHash}:${sessionId}:${n}`
  day: text("day").notNull(),                      // day the session STARTED
  visitorHash: text("visitor_hash").notNull(),
  startedAt: integer("started_at").notNull(),
  endedAt: integer("ended_at").notNull(),
  pageviews: integer("pageviews").notNull(),
  events: integer("events").notNull(),
  bounced: integer("bounced").notNull(),           // 0 | 1
  entryPath: text("entry_path").notNull(),
  exitPath: text("exit_path").notNull(),
  // first-touch facts:
  source: text("source").notNull().default(""),
  channel: text("channel").notNull().default(""),
  referrerHost: text("referrer_host").notNull().default(""),
  country: text("country").notNull().default(""),
  city: text("city").notNull().default(""),
  browser: text("browser").notNull().default(""),
  os: text("os").notNull().default(""),
  device: text("device").notNull().default(""),
}, (t) => [index("idx_sessions_day").on(t.day)]);

analyticsDay = sqliteTable("analytics_day", {
  date: text("date").primaryKey(),                 // UTC YYYY-MM-DD
  visitors: integer("visitors").notNull(),         // distinct visitor_hash that day
  pageviews: integer("pageviews").notNull(),
  visits: integer("visits").notNull(),             // sessions started that day
  bounceVisits: integer("bounce_visits").notNull(),
  visitDurationTotalS: integer("visit_duration_total_s").notNull(),
});

analyticsDayDim = sqliteTable("analytics_day_dim", {
  date: text("date").notNull(),
  dimension: text("dimension").notNull(),
  // page|entry|exit|source|referrer|channel|country|city|browser|os|device|event
  name: text("name").notNull(),
  visitors: integer("visitors").notNull(),
  pageviews: integer("pageviews").notNull(),       // for `event`: event count
}, (t) => [primaryKey({ columns: [t.date, t.dimension, t.name] })]);
```

Derived at read time, never stored: percentages, bounce rate, views/visit,
avg duration. Multi-day `visitors` is the **sum of daily uniques** — same
semantics as Plausible under its own daily-rotating identity; note this in a
code comment and optionally in the `/stats` footer.

---

## 3. Domain module `src/lib/domains/Analytics/`

```
shared.ts            SiteStats types + date ranges (replaces Plausible/shared.ts)
track.client.ts      inline tracker + useTrackEvent()
pulse.server.ts      beacon validation + normalization + insert (pure core, unit-testable)
identity.server.ts   daily salt + visitor hash
ua.ts                parseUserAgent()          (pure, no deps)
referrer.ts          classifyReferrer()        (pure, curated map)
sessionize.ts        pure session reducer      (pure)
rollup.server.ts     cron: sessions + aggregates + pruning
stats.server.ts      fetchSiteStats(range)     (reads aggregates)
```

### 3a. Tracker — `track.client.ts`

Independent implementation (~100 lines), not copied from Plausible's MIT
tracker:

- `trackPageview()` and `trackEvent(name, props)` build the payload and send
  via `navigator.sendBeacon("/api/pulse", blob)` with
  `fetch(..., { method: "POST", keepalive: true })` fallback.
- Payload: `{ id: crypto.randomUUID(), t: "pv"|"ev", p: location.pathname,
  r: document.referrer, n?, props?, sid, utm? }` where `utm` carries only
  `utm_source|utm_medium|utm_campaign` read from `location.search` (each
  ≤100 chars). Never send full URL, arbitrary query, or fragment.
- `sid`: `getOrCreatePresenceClientId(window.sessionStorage, undefined,
  "sreetamdas:analytics-session-id")` — per-tab, dies with the tab.
- Suppression: skip when `import.meta.env.DEV`, `navigator.webdriver`
  (unless `localStorage["sreetamdas:analytics-e2e"]` is set — lets Playwright
  opt in), or opt-out flag `localStorage["sreetamdas:analytics-optout"]`.
- SPA pageviews: fire once on mount, then subscribe to the router's
  `onResolved` event; dedupe consecutive identical pathnames. Mount as a tiny
  `<AnalyticsTracker />` client component rendered from `__root.tsx`'s shell
  (covers `(main)`, `(pure)`, and foobar routes).
- `useTrackEvent()` hook replaces `useCustomPlausible`; update the six call
  sites listed in §0 (mechanical: `plausibleEvent("foobar", { props: {...} })`
  → `trackEvent("foobar", { achievement: ... })`).

### 3b. Beacon route — `src/routes/(api)/api/pulse.ts`

POST only. Handler delegates to a pure `handlePulse(request, env)` in
`pulse.server.ts` (house pattern: route file thin, logic testable).

Validation — reject (but still return 204) unless ALL hold:

| Field | Rule |
| --- | --- |
| body | JSON, ≤2KB, `Content-Type` json or text/plain (sendBeacon sends text/plain) |
| origin | `Sec-Fetch-Site` ∈ {same-origin, none} OR `Origin` matches request host (filter, not proof) |
| `id` | UUID-v4ish `/^[0-9a-f-]{36}$/i` |
| `t` | `"pv"` or `"ev"` |
| `p` | starts with `/`, no `?`/`#`/`\`/`//`, ≤200 chars; normalize: strip trailing slash (keep bare `/`) |
| `r` | ≤500 chars; parsed with `new URL` → keep host only; self-host → "" |
| `n` | required iff `t==="ev"`; allowlist: `["foobar"]` |
| `props` | only key `achievement`, string ≤64 chars |
| `sid` | `isRealtimeClientId(sid)` |
| `utm` | each of the 3 keys optional, string ≤100 chars, control chars stripped |

Server derivations (never trust client for these): `occurredAt = Date.now()`;
`day` from `occurredAt` (UTC); geo from `request.cf.country`/`cf.city`
(nullable — default `""`); `browser/os/device` from the `User-Agent` header
via `parseUserAgent`; drop the request entirely if UA matches
`/bot|crawler|spider|crawling|headless/i`; `source/channel` via
`classifyReferrer` with **precedence `utm_source` > referrer host**;
`visitorHash` per §3c. Raw IP (`CF-Connecting-IP`) and raw UA are
request-local only — never written.

Insert: single `INSERT OR IGNORE` (PK `event_id` makes client retries no-ops).
Wrap in try/catch, `console.error` on failure, always `204` +
`Cache-Control: no-store` — the endpoint must never be an oracle.

### 3c. Identity — `identity.server.ts`

```
dailySalt(date)  = HMAC-SHA256(key: ANALYTICS_SALT_SECRET, msg: "salt:" + YYYY-MM-DD)
visitorHash      = hex(HMAC-SHA256(key: dailySalt, msg: len(ip)|ip|len(ua)|ua)).slice(0, 32)
```

WebCrypto (`crypto.subtle.importKey`/`sign`); length-prefixed fields (never
bare concatenation). Deterministic derivation deliberately avoids the
KV-at-midnight consistency problem; the documented tradeoff is weaker forward
secrecy if the master secret leaks (rotating `ANALYTICS_SALT_SECRET` at any
time is safe — it only splits visitor continuity for one day). No cookies, no
client storage, no cross-day identity: GDPR posture matches Plausible's
published approach (do not claim "no banner needed" anywhere as legal fact).

### 3d. UA parser — `ua.ts`

Regex table, ~40 lines, no dependency (do not vendor UAInspector/device
databases — license provenance). Order matters:

- Browser: Edge (`Edg/`), Opera (`OPR/`), Samsung Internet, Firefox, Chrome,
  Safari (after Chrome), else `"Unknown"`.
- OS: iOS (`iPhone|iPad`), Android, macOS, Windows, Linux, else `"Unknown"`.
- Device: `"Tablet"` if `iPad|Tablet`, `"Mobile"` if `Mobi|Android.*Mobile|iPhone`,
  else `"Desktop"`.

### 3e. Referrer/source/channel — `referrer.ts`

Curated map (extend from real traffic later; do not import Snowplow/GA4
datasets):

| Hosts (suffix match) | Source | Channel |
| --- | --- | --- |
| google.*, bing.com, duckduckgo.com, search.brave.com, ecosia.org, yandex.* | per-engine name | Organic Search |
| twitter.com, x.com, t.co | X | Organic Social |
| bsky.app, *.bsky.social | Bluesky | Organic Social |
| mastodon.social + known instances, elk.zone | Mastodon | Organic Social |
| linkedin.com, lnkd.in | LinkedIn | Organic Social |
| reddit.com, old.reddit.com | Reddit | Organic Social |
| news.ycombinator.com | Hacker News | Organic Social |
| facebook.com, m.facebook.com, l.facebook.com | Facebook | Organic Social |
| instagram.com, l.instagram.com | Instagram | Organic Social |
| chatgpt.com, chat.openai.com | ChatGPT | AI Assistants |
| claude.ai | Claude | AI Assistants |
| perplexity.ai | Perplexity | AI Assistants |
| gemini.google.com | Gemini | AI Assistants |
| github.com | GitHub | Referral |
| (any other host) | the host itself | Referral |
| (empty / self) | Direct | Direct |

`utm_source` (when present) wins as `source`; channel then = Organic Search /
Organic Social / AI Assistants if the utm_source matches a known name,
`Email` if `utm_medium === "email"`, else Referral.

### 3f. Session reducer — `sessionize.ts` (pure)

Input: one UTC day's events **plus** the last 30 min of the previous day and
the first 30 min of the next day (context window), sorted by
`(occurredAt, eventId)`. Output: sessions whose **first event falls on the
target day** (sessions belong to the day they start; context events only
extend/attach, never produce sessions for this day).

Stream key: `(visitorHash, sessionId)` — `sessionId` may be `""` (teed
Plausible events, §5), in which case streams key on hash alone. Within a
stream, split into sessions at gaps > **30 minutes** between consecutive
events.

Per session (Plausible semantics, used as a spec — implemented independently):

- `entryPath` = path of first **pageview**; `exitPath` = path of last
  pageview. A session with zero pageviews (custom events only) uses the
  event's path for both.
- `bounced` = 1 unless (≥2 pageviews) OR (≥1 custom event — all of this
  site's custom events are interactive).
- `visitDuration` = `endedAt - startedAt` (0 for single-event sessions).
- First-touch: `source/channel/referrerHost/country/city/browser/os/device`
  from the session's first event.

### 3g. Rollup cron — `rollup.server.ts` + `src/worker.ts`

Add to the exported handler in `src/worker.ts` (next to `fetch`;
`Sentry.withSentry` passes `scheduled` through):

```ts
scheduled: (controller, env, ctx) => ctx.waitUntil(runAnalyticsRollup()),
```

Hourly run, for `day` of `[today, yesterday]` (UTC — handles the midnight
boundary; idempotent full-day recompute):

1. Read the day's events + 30-min context windows (indexed by `day`; one
   day is a few thousand rows).
2. Run the reducer → `DELETE FROM analytics_sessions WHERE day = ?` +
   batched inserts, and the aggregates below, **in one `db.batch()`**
   (transactional).
3. `analytics_day`: visitors = distinct `visitorHash` in the day's events;
   pageviews; visits/bounceVisits/duration from the day's sessions.
4. `analytics_day_dim` rows: from events — `page` (per path),
   `country`/`city`/`browser`/`os`/`device` (visitors = distinct hashes,
   pageviews = count), `event` (name = `"foobar:" + prop`); from sessions —
   `entry`/`exit`/`source`/`referrer`/`channel` (visitors = distinct hashes,
   pageviews = session count). Delete-then-insert the day's dim rows in the
   same batch.
5. Once per UTC day (first run after 02:00):
   `DELETE FROM analytics_events WHERE day < date('now', '-180 days')`
   (batched with LIMIT if large). Sessions and aggregates are kept forever —
   that's the durable history; 180 days of raw is for replay/debug.

Also export `runAnalyticsRollup(day?: string)` so tests and manual backfills
can target a specific day. Cron notes: expressions are UTC; config changes
take up to ~15 min to propagate; jobs must not depend on exact-midnight
execution (they don't — full-day recompute).

### 3h. Read path — `stats.server.ts`

`fetchSiteStats(range: StatsDateRange): Promise<SiteStats>` reading only
`analytics_day` + `analytics_day_dim`:

- Ranges `7d|30d|91d|12mo|all` → date window ending today (UTC).
- Overview: sum `analytics_day`; `bounceRate = bounceVisits/visits`,
  `viewsPerVisit = pageviews/visits`, `visitDuration =
  visitDurationTotalS/visits` (guard zero).
- Breakdowns: sum dim rows per (dimension, name), rank desc, limit as the UI
  does today (8/6), `percentage = visitors / range visitors`.
- Timeline: per-day visitors from `analytics_day`.
- Countries: stored as ISO codes; display names via
  `new Intl.DisplayNames(["en"], { type: "region" })`.
- Same fail-soft contract as today: `status: "ready" | "missing-config" |
  "unavailable"` + `createEmptyStats`.

Types: `shared.ts` renames `PlausibleStats → SiteStats`,
`PlausibleDateRange → StatsDateRange`; keep `StatsBreakdownRow` /
`StatsCountryRow` shapes identical so
`src/routes/(main)/-stats/components.tsx` changes only imports/labels.
`-stats.server.ts` swaps in `fetchSiteStats`. `/stats` edge caching stays.

---

## 4. Testing

- **Unit** (`.config/vitest.unit.config.ts`): `parseUserAgent` fixture table;
  `classifyReferrer` (each channel, self-referral, utm precedence, garbage
  URLs); `identity` (same day+ip+ua stable, different day rotates, output has
  no raw ip/ua); pulse validation (every rejection row in the §3b table +
  a happy path asserting the exact inserted row); `sessionize`
  property-style fixtures — 30-min split, entry/exit, bounce rules (1 pv =
  bounce; 2 pv = not; 1 pv + foobar event = not), midnight-crossing session
  attributed to start day and not duplicated by the next day's run;
  rollup aggregation math from fixture events; `fetchSiteStats` assembly +
  percentage math from seeded aggregate rows.
- **Workers** (`.config/vitest.config.ts`): POST `/api/pulse` end-to-end
  against a real (miniflare) D1 — valid beacon inserts once, duplicate
  `event_id` inserts once, bot UA inserts nothing, always 204;
  `runAnalyticsRollup` against seeded events verifies sessions + aggregates;
  rerun is idempotent (identical tables).
- **e2e** (`e2e/`): set `localStorage["sreetamdas:analytics-e2e"]`, navigate
  `/` → `/blog`, assert two `pv` POSTs to `/api/pulse`; trigger konami,
  assert one `ev` beacon.

---

## 5. Migration sequence (each step independently deployable)

1. **Infra**: create the two analytics DBs, add bindings + cron + secret,
   typegen, generate + apply migrations (local, staging, prod).
2. **Ingest live, dual-run via server-side tee**: implement §3a–3e. Deploy
   the beacon route and tracker. Additionally, tee the existing Plausible
   event proxy (`src/routes/(api)/prxy/plsbl/api/event.ts`): after forwarding
   upstream, translate the Plausible payload (`n`, `u` → path, `r`, `d`) into
   a native event (server-generated `eventId`, `sessionId: ""`) and insert
   it. **Do not mount the new tracker yet** — for the parity window the only
   browser emitter is the existing Plausible script, and the tee gives both
   systems an identical input stream (two trackers would be adblocked
   differently and poison the comparison).
3. **Rollups**: deploy §3f–3g. Verify sessions/aggregates appear hourly
   (`wrangler d1 execute sreetamdas_analytics --remote --command "SELECT * FROM analytics_day ORDER BY date DESC LIMIT 5"`).
4. **Parity window (~1 week)**: compare `analytics_day` vs the Plausible
   dashboard daily. Acceptance: pageviews and visitors within ~10%/day
   (expect native ≥ Plausible once the native tracker ships, since Plausible's
   script is more widely adblocked; during the tee window they should be
   within ~2% since the input stream is shared).
5. **Read cutover**: deploy §3h; `/stats` now renders native data.
6. **Tracker cutover**: mount `<AnalyticsTracker />`, remove the Plausible
   script tags + inline stub from `__root.tsx`. The tee keeps double-writing
   for any cached HTML still loading the old script — harmless (different
   event streams now, but Plausible is no longer read).
7. **Backfill history** (before canceling Plausible):
   `scripts/backfill-plausible.ts` (tsx, local): Stats API v2 daily
   `visitors,visits,pageviews,bounce_rate,visit_duration` timeseries for
   `all` → `analytics_day` rows for dates **before native ingest began**
   (convert rates back to `bounceVisits`/`visitDurationTotalS`); monthly
   breakdowns (pages, sources, countries, devices, browsers, OS) →
   `analytics_day_dim` rows pinned to month-start dates (documented
   approximation). Emit one SQL file, apply with
   `wrangler d1 execute sreetamdas_analytics --remote --file`. Never
   overwrite dates that have native data.
8. **Teardown**: delete `src/routes/(api)/prxy/` (tee included),
   `src/lib/domains/Plausible/`, the `useCustomPlausible` import sites
   (already swapped in step 6), `PLAUSIBLE_*` from `.env.example` +
   secrets + typegen. Decide the `static.cloudflareinsights.com` preconnect:
   keep iff Cloudflare Web Analytics RUM stays enabled (recommended — free
   Core Web Vitals, independent of this system); otherwise remove both.
   Cancel the Plausible subscription. Keep `scripts/backfill-plausible.ts`
   in-tree for provenance.

---

## 6. Costs / limits sanity (Workers Paid)

- Beacon: one Worker request per pageview/event — noise against the 10M/mo
  included requests.
- D1: ~2 row-writes per event (row + 1 index) + rollup churn; tens of
  thousands of writes/day worst case vs 50M/mo included. Raw events at a few
  KB/row × 180 days is well under the 5GB included storage (10GB hard cap
  per DB). D1 is single-threaded per DB — fine, analytics has its own DB.
- Cron: 24 invocations/day, each reading a few thousand rows.
- Nothing here uses Queues, WAE, Workflows, R2, or Bot Management (the
  latter is Enterprise-only — `request.cf.botManagement` is NOT available;
  UA heuristics are the baseline, residual bot noise is a documented
  limitation).

## 7. Deliberately out of scope (record if revisited)

- Cloudflare Queues / Workflows / R2 exports (volume doesn't justify;
  `wrangler d1 export` + Time Travel cover backup).
- Engagement / scroll-depth / time-on-page telemetry (no UI renders it).
- Cross-day visitor identity (privacy feature, matches Plausible).
- Cities beyond `request.cf.city` (colo-coarse; label as approximate).
- Rate-limiting binding on `/api/pulse` (strict validation + 2KB cap + same
  origin filter first; add a WAF rate rule from the dashboard if abuse ever
  appears — no code change needed).
