# TanStack Start talk — companion & demo guide

Pair this with `talk-script.md`. If the script is _what to say_, this is _what to
open, click, and fall back to_ while presenting `/slides/tanstack-start`.

Routes involved:

- **Deck** — `/slides/tanstack-start` (MDX in `slides.re.mdx`, rendered by the shared
  slide shell). Slide position lives in the URL as `?slide=N&step=M`.
- **Live session API** — `/api/slides/session/$sessionId` (a Durable Object-backed
  server route).
- **Fallback proof page** — `/stats` and `/stats?period=nonsense` for typed URL state,
  loader deps, stale-time caching, and production streaming behavior.

> The premise is “the website is the demo.” The current flow is intentionally
> self-contained: the live demos live inside the deck, not on a separate showcase
> route. `/slides/tanstack-start/dev-lab` is the quick dev-loop cutaway, not a
> second talk track.

---

## 1. Current live demo map

| Script slide | Stay / cut to                     | What it proves                                  | Primary file(s) |
| ------------ | --------------------------------- | ----------------------------------------------- | --------------- |
| 15           | Stay on deck                      | Poll + thesis: server is opt-in                 | `-live-polls.ts` |
| 19           | Stay on deck                      | Client → middleware → server, typed context     | `-boundary.server.ts`, `-demos.tsx` |
| 21           | Stay on deck                      | Rendering mode poll                             | `-live-polls.ts` |
| 23           | Stay on deck                      | Skeleton now, slow server data later            | `-streaming.server.ts`, `-demos.tsx` |
| 29           | Optional `/stats?period=nonsense` | Garbage URL → typed safe default                | `src/routes/(main)/stats/route.tsx` |
| 30           | Stay on deck                      | The deck's own URL state is validated state     | `route.tsx`, `route-search.ts` |
| 33           | Stay on deck                      | RSC as server-produced data + client island     | `-rsc.server.tsx`, `-demos.tsx` |
| 35           | Stay on deck                      | Composite slots: server card, client-filled UI  | `-composite.server.tsx`, `-demos.tsx` |
| 37           | Optional `/slides/tanstack-start/dev-lab`       | Vite + TypeScript feedback loop                 | `/slides/tanstack-start/dev-lab` |
| 40           | Presenter deck + phone reaction   | Live slides over a Durable Object session       | `SlideSessionDurableObject.ts` |

Rule of thumb: **claim on the deck → prove in the deck → only cut away for `/stats`
or the optional local dev-loop app.**

---

## 2. Demo notes and fallbacks

### A. Server-function middleware — slide 19

`getBoundarySnapshot` is a `GET` server function with middleware that has both a
`.client()` half and a `.server()` half.

- On mount, the slide already has server-returned values.
- Press the demo button to call the same function from the browser.
- Point at request id / server-only context to show the boundary.

**Fallback:** if the button stalls, the SSR values are already on screen. Re-advance
to the slide to retry the call.

### B. Streaming SSR shape — slides 22–23

`getStreamingData` deliberately waits about 1.2s so the projector can show the
skeleton → panel transition.

**Precise wording:** this demonstrates the streaming half of PPR: shell first, slow
part later. It is not claiming a statically prebuilt PPR shell.

**Fallback:** open `/stats`; the dashboard shell renders before the numbers resolve.

### C. Typed URL state — slides 28–30 and `/stats`

Use the deck itself first: `slide`, `step`, `live`, and presenter state are validated
search params. If you want an external proof, use `/stats?period=nonsense` to show
bad URL input falling back to a safe typed value.

**Router-first line to remember:** the URL, loader, cache key, and navigation contract
live together instead of being duplicated across components, effects, and ad-hoc
parsers.

### D. RSC as data — slide 33

The bordered panel is produced by `renderServerComponent` on the server; the counter
next to it is normal client React. The client composes around server output without
making the whole app server-first.

**Fallback:** re-advance to the slide or read the code in `-rsc.server.tsx`.

### E. Composite slots — slide 35

The card is produced by `createCompositeComponent` on the server. The client fills
slots with interactive UI; one slot receives server data.

**Honest edges:** slots are opaque on the server, render-prop data must be
serializable, and this is still experimental alongside Start's RSC support.

**Fallback:** use the previous code build-up slide if the live round-trip errors.

### F. Deployment finale — slide 40

Fire a reaction from your phone joined as a viewer. The point is that the heart went
from phone → Durable Object → presenter deck in real time.

**Fallback:** show poll results already collected through the same session.

---

## 3. `/slides/tanstack-start/dev-lab` cutaway

This replaces the old “showcase page” idea. It is intentionally small, local, and
source-first: the browser only proves the route is alive while the IDE does the real
demo.

Current shape:

1. Open `route.tsx` beside `-dev-lab.server.ts` while `pnpm dev` is running.
2. Hover `validateSearch`, `loaderDeps`, `deps`, `Route.useSearch()`,
   `Route.useLoaderData()`, and `navigate({ search })`.
3. Make one deliberate edit live:
   - add/remove a `DevLabTopic`,
   - rename a search field,
   - pass an invalid value to a typed navigation helper,
   - save and show Vite HMR preserve the browser flow.

Do **not** let it become a second production companion page unless the talk changes
again. It exists to show local IDE type inference and the Vite feedback loop, not to
compete with the deck.

---

## 4. Live session mode

The deck itself is the deployment proof: one **session id → one Durable Object**.

### Roles & URL params (`validateSlideSearch`)

| Param          | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| `?live=<id>`   | Join session `<id>`                                            |
| `&master=1`    | Presenter/master: broadcasts position, poll controls           |
| `?presenter=1` | Presenter view / notes, independent of `master`                |
| `?slide=N`     | Current slide index                                            |
| `?step=M`      | Current `<Steps>` reveal within the slide                      |

- **Presenter:** open the deck with `?live=<id>&master=1`.
- **Viewer:** open the generated viewer link with `?live=<id>` and no `master`.
- **Transport:** WebSocket to `/api/slides/session/<id>` backed by
  `SlideSessionDurableObject`; viewers also have an HTTP snapshot safety net.

### Polls (`-live-polls.ts`)

Polls are pinned to deck-absolute slide indices:

| Slide | Question                                  | Options                              |
| ----- | ----------------------------------------- | ------------------------------------ |
| **15** | “Have you tried TanStack Start yet?”      | Yes · Not yet · Just here for vibes  |
| **21** | “Which rendering mode fits your app?”     | Full SSR · Data-only · Client-only   |

These indices are asserted in `-route.test.ts` as `[15, 21]`. If you add, remove, or
reorder slides before them, update both `-live-polls.ts` and the test.

---

## 5. Pre-flight checklist

- [ ] Deck open at `?slide=1` in a presenter/master window: `?live=<id>&master=1`.
- [ ] Phone joined as viewer; test one reaction.
- [ ] Poll overlay visible and connected.
- [ ] Fallback tabs open: `/stats` and `/stats?period=nonsense`.
- [ ] Editor open on: `-boundary.server.ts`, `-rsc.server.tsx`,
      `-composite.server.tsx`, `-streaming.server.ts`,
      `src/routes/(main)/stats/route.tsx`, and `SlideSessionDurableObject.ts`.
- [ ] Optional: `/slides/tanstack-start/dev-lab` route open if you decide to show Vite/TS live.
- [ ] Disable OS notifications / Do Not Disturb.
- [ ] Know the fallbacks above.

---

## 6. Likely Q&A

- **Production-ready?** Start is still stabilizing toward v1; this site runs on it. Be
  more cautious for an RSC-heavy production app.
- **Why not Next?** Next still wins for RSC ecosystem depth, image/font optimization,
  Vercel-first polish, and hiring. Start wins for router-first type safety, explicit
  server boundaries, Vite, and deployment portability.
- **Server functions vs server routes?** Server functions are typed RPC for your app
  calling itself. Server routes are public HTTP endpoints, like the slide session API.
- **Does caching replace React Query?** For loader data, often. Otherwise a loader can
  bridge to Query with `ensureQueryData`.
- **Is RSC the same as Next's?** No. Start treats RSC as opt-in server-rendered data
  the client composes around; composite slots add a typed client-fillable slot model.
