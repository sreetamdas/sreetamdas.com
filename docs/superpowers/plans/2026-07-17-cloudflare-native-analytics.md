# Replace Plausible with Cloudflare-native analytics

> **SUPERSEDED** by `2026-07-19-cloudflare-native-analytics-final.md` — after an
> independent review (Plausible/Counterscale source audit + platform-facts
> check), the WAE ingest layer described below was replaced with direct-to-D1
> raw events. Kept for the decision trail only.

Goal: remove Plausible entirely (tracker script, first-party proxies, Stats API,
paid subscription) and serve the same product — pageviews, custom foobar
events, and the public `/stats` dashboard — from Cloudflare primitives already
in this stack: a Workers Analytics Engine (WAE) dataset for ingest, D1 for
long-term rollups, and the existing TanStack Start worker for both.

The account is on the Workers Paid plan, which includes WAE (≈10M data points
written + 1M read queries per month in the base allotment — orders of magnitude
above this site's traffic) and cron triggers. No new paid products required.

## Why Workers Analytics Engine (and not the other Cloudflare options)

- **Cloudflare Web Analytics (RUM beacon)**: no custom events, no useful query
  API for the breakdowns `/stats` renders, third-party script. Rejected as the
  primary system. (Optional: keep it enabled purely for Core Web Vitals RUM —
  it's free and cookieless. If it stays, keep the
  `static.cloudflareinsights.com` preconnect in `__root.tsx`; if not, remove
  that preconnect too and disable auto-injection in the dashboard.)
- **Zone HTTP analytics (GraphQL API)**: counts every request including bots
  and cache hits, can't see SPA navigations or custom events. Not product
  analytics.
- **WAE**: custom dimensions, SQL read API, unlimited-cardinality writes from
  the worker, included in the paid plan. The one real constraint is ~**90-day
  retention** and **sampling semantics**, both designed around below.

## Current Plausible surface (what must be replaced or deleted)

- `src/routes/__root.tsx`: async script tag for `/prxy/plsbl/js/pa-*.js`,
  inline `window.plausible` queue stub, `data-api` pointing at the event proxy.
- `src/routes/(api)/prxy/plsbl/js/$script.ts` + test: script proxy.
- `src/routes/(api)/prxy/plsbl/api/event.ts` + test: event proxy.
- `src/lib/domains/Plausible/index.ts`: `useCustomPlausible()` — call sites:
  - `src/lib/domains/foobar/Pixel.tsx` (konami, campfire, error404, navigator, completed)
  - `src/lib/domains/foobar/Entry.tsx` (unlocked)
  - `src/lib/domains/foobar/DashboardClient.tsx` (restart, completed_page flags)
  - `src/lib/components/SocialLinks.tsx` (easter-egg)
  - `src/lib/components/Error.tsx` (dogs)
  - All fire `plausible("foobar", { props: { achievement } })` — one event
    name, one string prop. The `revenue`/`u` options are unused; drop them.
- `src/lib/domains/Plausible/stats.ts` + `shared.ts` + `stats.test.ts`:
  Stats API v2 client feeding `/stats`.
- `src/routes/(main)/stats/-stats.server.ts`: `getStats` server fn.
- `src/routes/(main)/-stats/components.tsx`: renders `PlausibleStats` —
  overview (visitors, visits, pageviews, views/visit, bounce rate, visit
  duration), top pages, entry/exit pages, sources, referrers, channels,
  countries (+code), cities, devices, browsers, OS, daily visitor timeline.
- Env/config: `PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID` in `.env.example`,
  `src/cloudflare-env.d.ts`, and as a worker secret.

## Architecture

```
browser (inline tracker, ~1KB, no external script)
  └─ sendBeacon POST /api/pulse        { t, p, r, n?, props?, sid }
       └─ worker route handler
            ├─ derive: country/city from request.cf, browser/os/device from UA,
            │          source/channel from referrer, daily visitor hash from
            │          salt+IP+UA (never stored raw)
            └─ env.ANALYTICS.writeDataPoint(...)          [WAE, 90-day raw]

cron (hourly)
  └─ rollup: WAE SQL API → aggregate → upsert D1 tables   [D1, forever]

/stats page
  └─ getStats server fn → fetchSiteStats(range) → reads D1 rollups only
```

Two non-obvious constraints force this shape:

1. **Prerendered HTML is served by Workers Assets before the worker runs** and
   is edge-cached, so server-side pageview logging in the fetch handler would
   miss most real page loads. Ingest must be a client beacon.
2. **WAE retains ~90 days**, so the `91d`, `12mo`, and `all` ranges on `/stats`
   must read from durable D1 rollups. Once rollups exist, use them for *every*
   range — one read path, no WAE query on the request path at all. Hourly
   rollups keep "today" at most an hour stale, which is fine for a public
   stats page that is itself edge-cached for 60s.

## Phase 1 — Ingest

### 1a. wrangler.jsonc

Add to the top level **and to each env** (mirror how `d1_databases` is
duplicated today):

```jsonc
"analytics_engine_datasets": [
  { "binding": "ANALYTICS", "dataset": "sreetamdas_site_analytics" }
],
"triggers": { "crons": ["17 * * * *"] }   // hourly rollup, see Phase 2
```

Use a distinct dataset per env (`sreetamdas_site_analytics_staging` etc.) so
staging noise never pollutes production numbers. Run `pnpm run cf-typegen` to
regenerate `cloudflare-env.d.ts` (adds `ANALYTICS: AnalyticsEngineDataset`).
Note: `wrangler dev` accepts `writeDataPoint` locally as a no-op-ish stub;
there is no local SQL query surface — unit tests mock the binding.

### 1b. Data point schema — document this exactly, blob order is the contract

One `writeDataPoint` per pageview/event:

| Field    | Content                                                        |
| -------- | -------------------------------------------------------------- |
| `index1` | daily visitor hash (also the sampling key — keeps one visitor's rows sampled together) |
| `blob1`  | type: `"pv"` or `"ev"`                                         |
| `blob2`  | path (normalized: strip query/hash, collapse trailing slash)   |
| `blob3`  | referrer host (empty for direct/self)                          |
| `blob4`  | source (classified: `"Google"`, `"GitHub"`, `"Direct"`, …)     |
| `blob5`  | channel (`"Organic Search"`, `"Social"`, `"Referral"`, `"Direct"`) |
| `blob6`  | country code (`request.cf.country`)                            |
| `blob7`  | city (`request.cf.city ?? ""`)                                 |
| `blob8`  | browser family (from UA)                                       |
| `blob9`  | OS family (from UA)                                            |
| `blob10` | device type (`"Desktop"`/`"Mobile"`/`"Tablet"` from UA)        |
| `blob11` | event name (`""` for pageviews; `"foobar"` for foobar events)  |
| `blob12` | event prop (`achievement` value; `""` otherwise)               |
| `blob13` | session id (client-minted, see 1c)                             |
| `double1`| `1`                                                            |

Keep a `src/lib/domains/Analytics/schema.ts` that names these slots as
constants and is imported by both the write path and the rollup queries so the
mapping can never drift.

**Visitor hash (privacy parity with Plausible)**: `sha256(dailySalt + ip + ua)`
truncated to 32 hex chars. `dailySalt = sha256(ANALYTICS_SALT_SECRET + UTC
date)` — deterministic daily rotation, no salt storage, no cross-day linkage.
IP comes from `CF-Connecting-IP` and is never written anywhere. No cookies, no
localStorage — same GDPR posture Plausible advertises.

**Session id**: random id in `sessionStorage` (reuse the
`getOrCreatePresenceClientId(storage, createId, key)` helper from
`src/lib/domains/Presence/client-id.ts` with a new key) — per-tab session,
cleared when the tab closes. Sent with each beacon; used only for
visits/bounce/duration/entry/exit computation in the rollup.

### 1c. Client tracker — `src/lib/domains/Analytics/track.client.ts`

No external script, no proxy: a small module imported by the root route.

- `trackPageview()`: `navigator.sendBeacon("/api/pulse", JSON)` with
  `fetch(..., { keepalive: true })` fallback; skips when
  `navigator.webdriver` (Playwright) or in dev (`import.meta.env.DEV`).
- SPA coverage: fire on initial mount, then subscribe to the router's
  `onResolved` event (dedupe consecutive identical pathnames) — this is what
  the Plausible script's auto pageview did.
- `useTrackEvent()` hook — drop-in replacement for `useCustomPlausible`:
  `trackEvent("foobar", { achievement: "..." })`. Same signature shape at the
  call sites; update the six files listed above and delete
  `src/lib/domains/Plausible/index.ts`.
- Mount: a tiny `<AnalyticsTracker />` client component rendered from
  `__root.tsx`'s shell (covers `(main)`, `(pure)`, foobar routes alike), where
  the plausible `scripts` entries are removed.

### 1d. Beacon route — `src/routes/(api)/api/pulse.ts`

`POST` handler (same pattern as the foobar cookie route):

- Parse+validate body: `{ t: "pv"|"ev", p: string, r: string, n?: string,
  props?: Record<string,string>, sid: string }`; reject >2KB bodies, bad
  types, non-relative paths, `sid` not matching the client-id pattern
  (`isRealtimeClientId`). Always return `204` `Cache-Control: no-store`
  (return 204 even on validation failure — never give probes an oracle).
- Compute derived dimensions (pure helpers, all unit-testable):
  - `parseUserAgent(ua)` → `{ browser, os, device }` — small regex table
    (Chrome/Safari/Firefox/Edge/Opera/SamsungInternet + iOS/Android/macOS/
    Windows/Linux + mobile/tablet heuristics). ~40 lines, no dependency.
    Return `"Unknown"` buckets; also short-circuit obvious bots
    (`bot|crawler|spider|headless`) to a drop.
  - `classifyReferrer(referrer, selfHostname)` → `{ host, source, channel }` —
    lookup table for major search engines and social sites; self-referrals →
    Direct. Port the categories the `/stats` UI already shows (channels:
    Organic Search / Social / Referral / Direct).
  - `computeVisitorHash(secret, date, ip, ua)` as above (WebCrypto
    `crypto.subtle.digest`).
- `env.ANALYTICS.writeDataPoint(...)` per the schema. Never throw to the
  client; wrap in try/catch, `console.error` on failure.
- New secret: `ANALYTICS_SALT_SECRET` (any long random string) — add to
  `.env.example` and worker secrets.

## Phase 2 — Rollups (the durable source of truth)

### 2a. D1 schema (drizzle, `src/db/schema.ts` + generated migration)

```ts
// one row per UTC day
analyticsDay: {
  date: text (YYYY-MM-DD, PK),
  visitors: integer, pageviews: integer, visits: integer,
  bounceVisits: integer, visitDurationTotalS: integer,
}
// one row per day × dimension × name
analyticsDayDim: {
  date: text, dimension: text, name: text,   // composite PK (date, dimension, name)
  secondary: text,                            // country code for countries, "" otherwise
  visitors: integer, pageviews: integer,
}
```

`dimension` ∈ `page | entry | exit | source | referrer | channel | country |
city | browser | os | device | event`. Percentages, bounce rate, views/visit,
and avg duration are all derived at read time — never stored.

### 2b. WAE SQL access

The SQL API is an account-level HTTP endpoint (not a binding):
`POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/analytics_engine/sql`
with an API token holding **Account Analytics: Read**. New secrets:
`CF_ACCOUNT_ID`, `ANALYTICS_READ_TOKEN` (add to `.env.example`,
`cloudflare-env.d.ts` via typegen, and worker secrets).

**Sampling rule**: never bare `count()` — always `sum(_sample_interval)` for
event counts, and `count(DISTINCT index1)`-style uniqueness only via the
grouped-fetch approach below (WAE may downsample; at this site's volume
sampling will essentially never trigger, but write the queries correctly
anyway).

### 2c. Rollup job — `src/lib/domains/Analytics/rollup.server.ts`

Wire a `scheduled` handler into `src/worker.ts`'s `exportedHandler` (next to
`fetch`; Sentry's `withSentry` passes it through). Each hourly run processes
**today and yesterday** (UTC) and upserts both — idempotent, self-healing if a
run is missed, finalizes yesterday shortly after midnight.

Per day, three queries against the dataset (`WHERE timestamp >= toDateTime(...)
AND timestamp < ...` for the day, `blob1 = 'pv'` where noted):

1. **Session rows** (for overview + entry/exit):
   `SELECT blob13 AS session, blob14... ` — actually select
   `blob13, index1 AS visitor, blob2 AS path, min(timestamp) AS first_seen,
   max(timestamp) AS last_seen, sum(_sample_interval) AS views
   GROUP BY blob13, index1, blob2` on pageviews, then finish in JS: group by
   session → `visits`, `bounceVisits` (sessions with 1 total view),
   `visitDurationTotalS` (last−first per session), entry page (path with min
   first_seen), exit page (path with max last_seen), `visitors` (distinct
   visitor hashes), `pageviews` (sum views). A personal site produces a few
   thousand such rows/day at most; paginate defensively (`LIMIT` + timestamp
   cursor) and cap at ~50k rows.
2. **Per-dimension counts** (pageviews): one query per dimension —
   `SELECT blobN AS name, sum(_sample_interval) AS pageviews,
   count(DISTINCT index1) AS visitors ... GROUP BY blobN ORDER BY pageviews
   DESC LIMIT 100`. (If `count(DISTINCT ...)` turns out unsupported on the
   deployed SQL surface, fall back to `GROUP BY blobN, index1` and count
   distinct in JS — same cardinality bound.)
3. **Events**: same as (2) filtered `blob1 = 'ev'`, grouped by
   `blob11, blob12` → dimension `event`, name `"foobar:" + achievement`.

Upsert with `onConflictDoUpdate` (replace values — recomputing a full day is
the idempotency mechanism; never increment). Keep the WAE fetch + parse in a
`queryAnalyticsSql()` helper with a validated response shape, mirroring how
`stats.ts` validates Plausible responses today.

Also export a `runAnalyticsRollup(day?)` server-only function so a backfill or
manual re-run is possible without waiting for cron (guard behind auth if ever
exposed as a route; simplest is to not expose it at all — cron + tests only).

## Phase 3 — Read path for `/stats`

- `src/lib/domains/Analytics/stats.server.ts`: `fetchSiteStats(range)` reads
  only D1: sum `analyticsDay` rows over the window (7d/30d/91d/12mo/all),
  timeline = per-day visitors, breakdowns = `analyticsDayDim` summed and
  ranked per dimension with percentages computed against the window's visitor
  total. Same fail-soft contract as today (`status: "ready" |
  "missing-config" | "unavailable"`, `createEmptyStats`).
- Types move to `src/lib/domains/Analytics/shared.ts`: mechanical rename
  `PlausibleStats → SiteStats`, `PlausibleDateRange → StatsDateRange`,
  `DEFAULT_PLAUSIBLE_SITE_ID` dropped; `StatsBreakdownRow`/`StatsCountryRow`
  keep their exact shapes so `src/routes/(main)/-stats/components.tsx` only
  changes imports/labels. Remove the "powered by Plausible"-type copy in
  `StatsStatus` if present.
- `-stats.server.ts` swaps `fetchPlausibleStats` → `fetchSiteStats`. The
  existing `/stats` edge caching (60s, `STATS_CACHE_HEADERS`) already bounds
  D1 read load; no request-path WAE calls exist to worry about.
- Country names: D1 stores ISO codes; render names via
  `new Intl.DisplayNames(["en"], { type: "region" })` at read time (drop the
  stored-name/`secondary` duplication if this proves sufficient — then
  `secondary` stays `""` everywhere and can be reserved for future use).
- Accepted parity losses (document on the page footer if desired): cities are
  colo-derived and coarser than Plausible's GeoIP; bounce/duration are
  session-approximations; history older than the migration date comes from
  backfill (below).

## Phase 4 — Backfill from Plausible (before canceling the subscription)

`scripts/backfill-plausible.ts` (tsx, run locally once, then delete or keep):

1. Pull from Plausible Stats API v2 with the existing `PLAUSIBLE_API_KEY`:
   - daily `visitors,visits,pageviews,bounce_rate,visit_duration` timeseries
     for `all` → `analyticsDay` rows (convert bounce_rate/duration back into
     `bounceVisits`/`visitDurationTotalS` so read-time derivation works).
   - monthly breakdowns (pages, sources, countries, devices, browsers, OS) →
     `analyticsDayDim` rows pinned to the first day of each month (documented
     approximation: pre-migration breakdowns have month granularity).
2. Emit a single SQL file and apply with
   `wrangler d1 execute sreetamdas_com --remote --file ...` (same flow as
   existing migrations). Idempotent: `INSERT OR REPLACE`.
3. Only after verifying `/stats` renders sane historical data: cancel
   Plausible, delete the `PLAUSIBLE_*` secrets.

## Phase 5 — Deletions and cleanup

- Delete: `src/routes/(api)/prxy/` (both plsbl routes + tests — nothing else
  lives under prxy), `src/lib/domains/Plausible/` entirely,
  `useCustomPlausible` imports (replaced in Phase 1c).
- `__root.tsx`: remove both plausible `scripts` entries; keep or drop the
  `static.cloudflareinsights.com` preconnect per the Web Analytics decision.
- Env: remove `PLAUSIBLE_API_KEY`/`PLAUSIBLE_SITE_ID` from `.env.example`,
  worker secrets, and `wrangler types` regen for `cloudflare-env.d.ts`.
- `public/_headers` / SW: no changes needed (`/api/pulse` is a worker route;
  confirm `foobar-sw.js` doesn't intercept `/api/` — it doesn't today).

## Testing

- **Unit** (`.config/vitest.unit.config.ts`): `parseUserAgent` fixture table;
  `classifyReferrer` (search/social/self/direct/unknown); visitor hash — same
  day+ip+ua stable, different day rotates, no raw ip in output; beacon body
  validator (rejects oversized/malformed, normalizes paths); rollup math from
  fixture session rows (visits/bounce/duration/entry/exit); `fetchSiteStats`
  assembly + percentage math from D1 fixtures (in-memory better via the
  existing db test harness used by `cloud-progress.data.server.test.ts`).
- **Worker tests** (`.config/vitest.config.ts`): `/api/pulse` end-to-end with
  a stub `ANALYTICS.writeDataPoint` capturing the data point; scheduled
  handler with a mocked SQL API response upserting D1.
- **e2e**: navigate `/` → `/blog` and assert two `/api/pulse` `pv` requests
  (note `navigator.webdriver` skip must be bypassable via a query flag or the
  tests intercept at the network layer instead); konami on a page asserts a
  `foobar` `ev` beacon.
- **Manual cutover checklist**: deploy with both systems live (tracker sends
  to `/api/pulse` while the Plausible script still runs), compare a few days
  of WAE numbers vs Plausible dashboard (expect within ~5–10% — adblockers
  block Plausible's proxied script more than a first-party JSON POST), then
  Phase 4 backfill, then Phase 5 removal, then cancel the subscription.

## Execution order (each step deployable on its own)

1. Phase 1 (binding + beacon + tracker, dual-running with Plausible).
2. Phase 2 (D1 migration + hourly cron rollup) — verify rows appear in D1.
3. Phase 3 (`/stats` reads D1) — visually compare against Plausible.
4. Phase 4 (backfill) → 5 (rip out Plausible, cancel subscription).

## Open decisions for the implementer to confirm with Sreetam

1. Keep Cloudflare Web Analytics RUM for Core Web Vitals alongside this?
   (Default: yes, it's free and independent.)
2. `count(DISTINCT ...)` support on the WAE SQL endpoint — verify once with a
   live query; the JS-side fallback is specified above either way.
3. Whether pre-migration monthly-granularity breakdowns are acceptable on
   `/stats` for `12mo`/`all` (they were only ever approximate percentages).
