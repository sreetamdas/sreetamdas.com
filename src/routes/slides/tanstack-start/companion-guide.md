# TanStack Start talk — companion & demo guide

Everything you need to drive the deck, the companion showcase, and the live
session on stage. Pair this with `talk-script.md` (the read-aloud script). If the
script is _what you say_, this is _how the machinery works_ and _what to click_.

Routes involved:

- **Deck** — `/slides/tanstack-start` (MDX in `slides.re.mdx`, rendered by the shared
  slide shell). Slide position lives in the URL as `?slide=N&step=M`.
- **Companion showcase** — `/slides/tanstack-start/showcase` (the "proof page").
- **Live session API** — `/api/slides/session/$sessionId` (a Durable Object).

> The whole premise of the talk is "the website is the demo." Everything below is a
> real, in-production code path on this site — not a sandbox. If you claim it on
> stage, you can open the file.

---

## 1. The companion page at a glance

`…/showcase?feature=<id>` is a single route whose content is driven by a typed
search param. It is **not a second slide deck** — it's a prop you cut to when the
talk moves from a claim to proof, then cut back.

It demonstrates, top to bottom:

1. **Typed router state** — the feature pills are typed `<Link>`s; `?feature=` is
   validated by `validateShowcaseSearch`, and bad values fall back to `router`.
2. **Typed server boundary** — the hero panel calls `getShowcaseSnapshot`, a server
   function with **client + server middleware**, during SSR and again from the browser.
3. **RSC as data** — a server-rendered subtree from `renderServerComponent`, composed
   next to a client island.
4. **Streaming SSR (PPR's streaming half)** — a deliberately slow loader promise that streams in.
5. **Built-in caching** — per-route `staleTime` examples.
6. **Deferred hydration** — a below-the-fold island that hydrates on scroll.

The page also carries on-screen speaker scaffolding (TalkUseGuide, FeatureStory,
SpeakerFlow) so you can present from it directly if a slide misbehaves.

### Feature pills (`?feature=`)

| `?feature=`  | Pill label            | What it proves                                   |
| ------------ | --------------------- | ------------------------------------------------ |
| `router`     | Typed router state    | URL state is validated once and shared by type   |
| `server`     | Typed server boundary | Client→middleware→server, typed context          |
| `rsc`        | RSC as data           | `renderServerComponent` subtree as loader data   |
| `streaming`  | Streaming SSR         | Un-awaited loader promise streams into the shell |
| `rendering`  | Rendering control     | SSR/RSC/static/selective + deferred hydration    |
| `deployment` | Deployment portability| Same routes on Workers + D1 + KV + DOs           |

Changing the pill updates the URL and the **FeatureStory** card (Next pain → Start
move → repo proof → how it helps the talk → what to do live → files to open). The
hero server-function panel stays mounted across pills; the streaming, RSC, caching,
and hydration **demos are always-on sections lower on the page** (scroll to them).

---

## 2. The live demos, one by one

### A. Server-function middleware — `?feature=server`

**File:** `showcase/-showcase.server.ts`, rendered by `FunctionMiddlewareDemo` in
`showcase/-components.tsx`.

- `getShowcaseSnapshot` is a `GET` server function with a `showcaseFunctionMiddleware`
  that has a `.client()` half and a `.server()` half.
- The `.client()` half sets `clientRuntime` to `"server render"` or `"browser call"`
  depending on where it runs. The `.server()` half reads the `cf-ray` header for a
  `requestId` and adds a server-only `serverRuntime`.
- The loader calls it during **SSR** (so the panel is filled on first paint). The
  **"Call server function again"** button calls the *same* function from the browser.

**On stage:** open the pill, point at the snapshot (filled from SSR), press the
button. `client context` flips from `server render` → `browser call`, `request id`
changes, and `server-only fn` shows a string that "was produced on the server and
never shipped." That single function spanned the network.

**Fallback:** if the button does nothing (network/socket), the SSR values are still
on screen — point at `request id` and `server-only fn` and make the same point.

### B. Streaming SSR — PPR's streaming half — `?feature=streaming`

**Files:** `showcase/-streaming.server.ts` (the slow server function),
`showcase/route.tsx` (loader returns the promise **un-awaited**), `StreamingDemo` in
`-components.tsx` (`<Suspense>` + `<Await>`).

- `getStreamingShowcaseData` sleeps `STREAMING_DEMO_DELAY_MS` (**~1200ms**) on purpose
  so the streaming boundary is visible on a projector.
- The route loader returns `streamed: getStreamingShowcaseData()` — **not awaited** —
  so Start flushes the shell + skeleton immediately and streams the panel in when it
  resolves, over the same HTTP response.
- The **"Stream again"** button re-runs the same function from the browser (with the
  skeleton showing during the wait) so you can re-trigger it live.

**On stage:** switch to the pill and **reload** the page. The shell and skeleton
paint instantly; ~1.2s later the panel fills. Say: "the real `/stats` does this too,
just faster." Then press **Stream again** to repeat on demand.

**Why it matters:** it's the same React streaming Next.js PPR uses for its dynamic
holes — `<Suspense>` + `<Await>` over a single response — with no proprietary API and
no Vercel lock-in.

**What it is _not_ (be precise on stage):** PPR's defining move is prebuilding a
**static shell** at build time and serving it from the edge with zero per-request
work, streaming in only the dynamic holes. Here the shell is **server-rendered per
request** (the loader reads request headers). So this is the _streaming_ half of PPR,
not the _partial-prerender_ half. Same user-visible payoff; different mechanism. If
you want true PPR parity, prerender the shell statically (Start supports it) and defer
only the dynamic hole — Start just won't infer that boundary for you the way Next does.

**Fallback:** open `/stats` — the dashboard chrome renders before the numbers land
(real production streaming). If even that resolves too fast on good wifi, lean on the
showcase's deliberate delay.

### C. React Server Components — `?feature=rsc`

**Files:** `showcase/-rsc.server.tsx` (`renderServerComponent(<ServerComposedPanel/>)`),
`ServerComponentDemo` in `-components.tsx`.

- The loader awaits `getShowcaseRsc()`, which renders a **server-only subtree** with
  `renderServerComponent`. That subtree reads request-time, server-only values (a
  timestamp, the user-agent, a `createServerOnlyFn` string) and emits finished markup.
- The page renders that subtree next to an **interactive client island** (a counter).

**On stage:** point at the bordered panel — "every value in this was produced on the
server; the browser never imported this component." Then click the counter beside it —
"and the page around it is ordinary, interactive React. The client composes around
server output; it doesn't opt out of it." This is the live version of the blog's MDX
RSC rendering (`blog/$slug/-$slug.server.tsx`).

**Fallback:** the panel is static server HTML, so it's always present even with no JS —
just read the values aloud.

### D. Built-in caching (always-on `CachingDemo` section)

**Proof in code:** every route sets a `staleTime` — blog `1000*60*60*24` (a day),
`/stats` `1000*60*5` (5 min), this showcase `1000*30` (30s).

**On stage:** navigate from the showcase to `/stats` and back (links are in the demo).
The revisit is instant because the loader is served stale-while-revalidate. Mention the
`ensureQueryData` bridge: the same loader can hydrate from a TanStack Query client.

### E. Deferred hydration — `?feature=rendering`

**File:** `DeferredHydrationIsland` wrapped in `<Hydrate when={visible({ rootMargin })}>`.

**On stage:** scroll to the island, **View Source** (markup is present, indexable,
styled), then note the counter only starts working after it scrolls into view and
hydrates. "HTML now, JavaScript later, on purpose."

---

## 3. Live session mode (the finale, and the deck transport)

The deck itself is the deployment proof: one **session id → one Durable Object**.

### Roles & URL params (`validateSlideSearch`)

| Param         | Meaning                                                              |
| ------------- | ------------------------------------------------------------------- |
| `?live=<id>`  | Join session `<id>` (string, `[a-zA-Z0-9_-]{1,80}`)                  |
| `&master=1`   | You are the **presenter** — broadcast position, poll controls       |
| `?presenter=1`| Presenter **view** (speaker notes / Alt+B), independent of `master` |
| `?slide=N`    | Current slide index                                                 |
| `?step=M`     | Current `<Steps>` reveal within the slide                           |

- **Presenter:** open the deck with `?live=<id>&master=1`. The overlay shows a
  **"Viewer link"** (`getViewerLink` — the same URL with `?live=<id>`, no `master`).
  Share/QR that to the room.
- **Viewers:** open `?live=<id>`. Their slide follows yours; they can vote in slide
  polls and send reactions.
- **Transport:** a WebSocket to `/api/slides/session/<id>` (the `SlideSessionDurableObject`).
  Viewers also have an HTTP snapshot poll as a best-effort safety net.

### Polls (`-live-polls.ts`)

Polls are pinned to slide indices and fire when the presenter lands on that slide:

| Slide | Question                                  | Options                                        |
| ----- | ----------------------------------------- | ---------------------------------------------- |
| **7** | "Have you tried TanStack Start yet?"      | Yes · Not yet · Just here for vibes            |
| **17**| "Which rendering knob feels most useful?" | Selective SSR · Deferred hydration · RSC as data |

> ⚠️ These slide indices are asserted in `-route.test.ts` (`[7, 17]`). If you
> add/remove/reorder slides, update **both** `-live-polls.ts` and that test, and
> re-verify indices (see §6).

### Reactions

Audience reactions ride the same hibernatable WebSocket: 👍 👏 😂 🤯 ❤️. The
presenter (master) sees the aggregated reaction cluster.

**On stage:** at the finale, fire a ❤️ from your phone (joined as a viewer) so the
room sees it land on the projected deck. "That came from a phone, through a Durable
Object, onto this screen, in real time."

---

## 4. Keyboard & navigation (SlideDeck)

| Keys                              | Action                          |
| --------------------------------- | ------------------------------- |
| `→` / `Page Down` / `Space`       | Next step or slide              |
| `←` / `Page Up`                   | Previous step or slide          |
| `Alt`+`B`                         | Toggle presenter mode           |
| `Alt`+`T`                         | Toggle slide transitions        |
| Touch swipe                       | Prev/next (mobile)              |

`<Steps>` reveals advance one at a time before moving to the next slide, so the
`(CLICK)` cues in the script map 1:1 to arrow presses.

---

## 5. Pre-flight checklist (stage setup)

- [ ] Deck open at `?slide=0` on the projector output.
- [ ] Tabs queued in order: `/stats` · `/stats?period=nonsense` ·
      `…?feature=server` · `…?feature=rsc` · `…?feature=streaming` · `…?feature=rendering`.
- [ ] Second window joined as **presenter** (`?live=<id>&master=1`); viewer link copied.
- [ ] Phone joined as a **viewer** (`?live=<id>`); test one reaction.
- [ ] Hard-refresh `…?feature=streaming` once so the stream is warm.
- [ ] Editor open on: `stats/route.tsx`, `stats/-stats.server.ts`,
      `showcase/-showcase.server.ts`, `showcase/-rsc.server.tsx`,
      `showcase/-streaming.server.ts`, `SlideSessionDurableObject.ts`.
- [ ] Network check: the live session and streaming both want a working connection —
      have the conference wifi tested, and a phone hotspot as backup.
- [ ] Disable OS notifications / Do Not Disturb.
- [ ] Know your fallbacks (every demo below has one).

---

## 6. Demo choreography (what to cut to, when)

| Script slide | Cut to                          | The "aha"                                   |
| ------------ | ------------------------------- | ------------------------------------------- |
| 11           | `/stats?period=nonsense`        | Garbage URL → typed safe default            |
| 13           | `…?feature=server`              | One middleware, client + server halves      |
| 17 (poll)    | (stay on deck)                  | Poll fires; set up next demo while it runs  |
| 18           | `…?feature=rendering`           | View-source markup; counter hydrates on scroll |
| 19           | `…?feature=streaming` (reload)  | Shell now, panel streams in ~1.2s later     |
| 23 (finale)  | presenter deck + phone reaction | ❤️ from a phone lands on the projector      |

Rule of thumb: **claim on the deck → prove on the companion → return to the deck.**
Don't let the companion become the talk; the SpeakerFlow card on the page reminds you.

---

## 7. If something breaks (fallbacks)

- **Streaming resolves too fast / too slow:** the showcase delay is fixed at ~1.2s;
  if wifi makes the real `/stats` instant, use the showcase. If the showcase stalls,
  press "Stream again" or just narrate the un-awaited-promise code.
- **Server-function button dead:** SSR already filled the panel — read those values.
- **Live socket drops:** show the poll *results* already collected (same DO round-trip);
  the snapshot HTTP poll may also recover viewers automatically.
- **Projector/clicker flaky:** arrow keys and `Space` advance; `Alt`+`B` for notes.
- **Whole companion down:** the deck stands alone; every claim still maps to a file you
  can open in the editor.

---

## 8. Likely Q&A

- **Production-ready?** Release Candidate, feature-complete, stabilizing toward v1.
  This site runs on it.
- **Why not Next?** Still the pick for RSC ecosystem, image/font optimization, hiring.
  Start wins on type-safety, deployment portability, the dev loop, explicit middleware.
- **vs React Router v7?** Same Vite-era DX; Start's edge is end-to-end type safety and
  the client+server function middleware.
- **Does caching replace React Query?** For loader data, often. Otherwise the loader can
  `ensureQueryData` and share the Query cache.
- **Is RSC the same as Next's?** No — server components are treated as *data* the client
  composes, and it's experimental in Start today.

---

## 9. Editing / extending the deck

- **Slides:** `slides.re.mdx` — slides are split on lines that are exactly `---`. Use
  `<Steps>` for progressive reveals and `<Notes>` for speaker notes. The title build is
  `<MainTitle stage="…">` (`-components.tsx`).
- **Polls:** `-live-polls.ts` (pinned to slide indices). **Update `-route.test.ts` too.**
- **Showcase:** `showcase/route.tsx` (loader: snapshot awaited, `streamed` deferred, `rsc`
  awaited), `showcase/-components.tsx` (sections + feature cards), `-showcase.server.ts`
  / `-rsc.server.tsx` / `-streaming.server.ts` (server functions), `-shared.ts` (the
  `ShowcaseSection` union + `parseShowcaseSection`).
- **Verify after changes:**
  - `pnpm typecheck`
  - `pnpm exec vp test run --config .config/vitest.unit.config.ts src/routes/slides/tanstack-start`
  - Re-check slide indices match the polls (the deck must have the premise poll at
    slide 7 and the rendering poll at slide 17).
