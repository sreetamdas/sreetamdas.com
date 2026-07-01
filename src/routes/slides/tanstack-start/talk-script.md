<!--
notes

https://tanstack.com/blog/tanstack-open-source-awards-2026
RSC first teased: https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components
Composite slots: https://tanstack.com/start/latest/docs/framework/react/guide/server-components#composite-slots

Tweets referenced in the "looking around" beat:
- Vite appreciation (2022): 1499430674746736644
- Remix + Vite: 1813803190414110874
- "very tempted": 1813803997876441264
- Next.js 16.3: 2071647669467201657

-->

# TanStack Start — talk script

Read-aloud script for the deck at `/slides/tanstack-start`. Paste straight into
Notion (headings/callouts survive). Target run time **~30 min**.

**Legend**

- **SAY** — spoken lines, written the way you'd actually say them (read, don't recite).
- **(CLICK)** — advance one `<Steps>` reveal, one magic-move state, or one slide.
- **[DEMO]** — do the live thing. Every demo is a slide _in the deck_ — you advance to it.
- **[FALLBACK]** — what to say/show if the live demo misbehaves. Always have this ready.
- **⏱** — cumulative target time.

> Section numbers below are **deck-absolute slide indices** (the `?slide=N` value),
> so they match the live-session counter and `-live-polls.ts` exactly. Slide 0 is a
> blank lead-in; the animated title build is slides **1–5**.
>
> Running order follows the "What" as: **client-first/server-available → type safety
> → composite components → ecosystem → deployment → how**.
>
> The demos all live in the deck — there is no separate showcase page. Every live
> demo is a slide backed by a real server function; if one misbehaves, re-advance to
> re-run it, or fall back to the real page noted inline (`/stats`).

---

## Pre-flight (before you're mic'd)

- Deck open at `?slide=1`, in a window joined to the **live session**
  (`?live=<id>&master=1`). Hard-refresh once; confirm the poll overlay connects.
- Phone on the live session as an audience member, so you can show a vote/reaction land.
- One fallback tab for the typed-URL beat: `/stats` and `/stats?period=nonsense`.
- Editor open on the "show the code" files (all in `slides/tanstack-start/`):
  `-boundary.server.ts`, `-rsc.server.tsx`, `-composite.server.tsx`,
  `-streaming.server.ts`, and `stats/route.tsx`, plus `SlideSessionDurableObject.ts`.
- Walk the RSC, composite, and streaming demo slides once so their server functions
  are warm, not cold (the streaming one is deliberately ~1.2s).

---

## 1–5 · Title build ⏱ 0:00

> The animated title is intentional — let it breathe. Slide 1 shows the greeting;
> the build strips the title back and rebuilds it.

**SAY:** "Hello, good morning everyone! It is genuinely so awesome to be here at
React Nexus — in front of, and honestly among, so many amazing speakers. (CLICK) I
gave my first talk back in 2021, at React Day Bangalore — so it's really special to
be back here, on such a huge stage. (CLICK) Today, I want to talk to you about
TanStack Start."

---

## 6 · Sreetam Das ⏱ 1:00

**SAY:** "Quick intro: I'm Sreetam. I'm a Senior Frontend Engineer on the Web
Experience team at Remote. And — full disclosure — I build _way_ too many things on
my personal website. Which is the thing you're looking at right now: this whole deck
is just a route on it."

---

## 7 · Six versions in. Maybe seven. ⏱ 1:45

> This is the hook. The chart is a live star-history of `sreetamdas.com`; it loads
> from an external URL, so if the venue wifi is flaky, don't panic — talk over it.

**SAY:** "Here's that website. My first commit was back in 2016. And since then it's
been through a _bunch_ of versions — and a bunch of frameworks. (beat) It's basically
my playground: it's where I actually use the cool stuff I come across — zustand,
styled-components, Tailwind, Drizzle — instead of spinning up one-off demo apps I'd
never want to maintain or grow past the demo stage. (CLICK to land the punchline)
And after six rewrites — maybe seven, honestly I've lost count, which is kind of the
whole point — I feel really confident saying this: I think TanStack Start is the best
way to build full-stack React apps today. The rest of the talk is me showing you why,
using this exact site."

---

## 8 · History time ⏱ 2:30

> One line per version — let the list land, don't read them all. The point is the
> _shape_ of the journey, not any one stop.

**SAY:** "Quick history. v1: plain HTML and CSS. (CLICK) v2: a redesign, still
static. (CLICK) v3: I went React SPA. (CLICK) v4: Next.js, the pages router. (CLICK)
v5: the App Router and RSC. (CLICK) v6: Cloudflare and OpenNext. (CLICK) And v7 —
the current one — TanStack Start. I'm not reading these to brag; I'm reading them
because I've shipped each of these. The comparison today isn't theoretical."

---

## 9 · Remote (sponsor) ⏱ 3:15

**SAY:** "One quick word on Remote, who's making this possible. Remote helps companies
hire, manage, and pay people anywhere in the world. (CLICK) Full-time, contractors,
payroll. (CLICK) No offices. (CLICK) And yes — I work remotely, for Remote. (CLICK)
And yes, we get the TV-remote questions. Every time."

**Notes for you:** Global employment is genuinely hard — different laws, taxes,
payroll, compliance in every country. Remote owns entities and in-house legal/payroll
in each market so you don't stitch it together yourself. Keep this to ~20 seconds.

---

## 10 · Engineering at Remote ⏱ 3:45

**SAY:** "For context on where my instincts come from: I've been at Remote since
2020 — four years in Growth Engineering, now Web Experience. We're around 300
engineers, ~50 teams, 40-plus countries. The backend is millions of lines of Elixir.
And the frontend is Next.js as an SPA, with TanStack Query and TanStack Table doing
the heavy lifting. So when I compare Start to Next today, it's not theoretical — I
ship Next for a living. Hold onto that TanStack Query and Table detail; it comes back."

---

## 11 · Next.js is the benchmark ⏱ 4:45

**SAY:** "And let's be honest about the benchmark, which is Next. It's really common
to dunk on Next.js — I'll try not to do too much of that, because the truth is Next
is the bar everything else is measured against. It was the de-facto framework for
React; even the React docs recommended it. (CLICK) I was genuinely _hyped_ when
React Server Components were first teased — December 2020. (CLICK) And that excitement
carried right through when Next 13 shipped them with the App Router. (CLICK) Layouts
are a genuinely great idea — a clean way to share data and rendering across pages.
(CLICK) And you stopped needing API routes just to talk to your own server. That was
a big deal."

---

## 12 · Next.js 16.3 (credit where due) ⏱ 5:15

**SAY:** "And credit where it's due — with the latest release, 16.3, the team really
cooked. I mean that. I'm not up here to dunk; this is me saying the benchmark keeps
getting better. (beat) But even so — the App Router changed something fundamental for
me, and that's the part I want to talk about."

> This is the tweet slide. Let it sit for a second; it earns you the goodwill to be
> critical next.

---

## 13 · But the model flipped ⏱ 6:15

**SAY:** "Here's what got complicated for me. The App Router flipped the rendering
model: components are server-first _by default_. (CLICK) So `"use client"` ended up
everywhere you wanted state, or interactivity, or an effect. (CLICK) You're writing
React kind of backwards from how we'd always written it — client-first, functions as
first-class citizens you could pass around freely. (CLICK) Now only serializable props
could cross the server/client boundary. (CLICK) And here's the sneakiest one: importing
a Server Component into a Client Component silently forced the _entire subtree_ to
become client-side — no error, no warning — just wiping away the RSC benefits you came
for. (CLICK) Caching was suddenly a thing you had to actively think about. (CLICK) The
dev server seemed super slow — and honestly, I hated being locked out of Vite. (CLICK)
Then there was more surface to learn — partial pre-rendering, `use cache` — and, since
most of my projects have exactly zero users, I was growing wary of being locked into one
platform. The thing I kept feeling: the whole app was getting built _around_ RSCs. I
didn't want the server to be mandatory. I wanted it to be _available_."

> Don't crap on it — App Router is good. The point is the inversion, not a bug.
> The composition footgun is the most honest gripe — no error, just silent
> regression. Say it plainly. The "zero users" line gets a laugh and it's true.

---

## 14 · So around 2024, I was open to looking around ⏱ 7:30

**SAY:** "So around 2024, I was open to looking around. (CLICK) I'd been enjoying
the Vite dev experience since 2022 — a SvelteKit detour, `sreetamandareena.com`, was
what made it really click for me. (CLICK) Remix shipped a new Vite integration — and
I was very tempted. (CLICK) And right around then, TanStack Start was announced in
alpha. (CLICK) And as luck would have it, I got pretty busy with work — new role — so
the site sat for a bit, and Start just kept getting more polished. And, you know,
since 2024, doing a 'large' migration got a lot more approachable — even with a lot
going on in life."

> Keep this to ~40s. Embed the tweets (1499430674746736644, 1813803190414110874, 1813803997876441264) only if you have time — the beat works without them.

---

## 15 · Start's bet: the server, opt-in ⏱ 8:15

**SAY:** "And that's Start's bet, in one line: you don't build the app around the
server — the server is just _there_, wherever and whenever you reach for it. (CLICK)
No relearning React — Start is full-stack functionality layered on top of TanStack
Router. (CLICK) You add the server gradually, per route: you opt _in_, you don't opt
out. (CLICK) You deploy anywhere — no first-party host quietly shaping the framework.
(CLICK) TypeScript is first-class end to end, and it's built on Vite. Those pay off
later; hold onto them."

> 🗳 **Live poll fires here (slide 15).** "Have you tried TanStack Start yet?" Let
> them vote; read the room out loud ("okay, mostly 'not yet' — perfect, this is for you").

---

## 16 · Client-first, server-available ⏱ 9:00

**SAY:** "So what does 'the server, available' actually get you? You write your React
the way you always have, and you reach for these per route, only where they help.
(CLICK) Server-side rendering. (CLICK) Progressive loading with streaming. (CLICK)
API routes. (CLICK) Server functions — type-safe RPCs you call straight from the
client. (CLICK) Middleware — with a client half and a server half. (CLICK) And you
deploy anywhere, or self-host. We'll walk each one, then tie them together in one
connected example."

---

## 17 · Server functions are typed RPC ⏱ 9:45

> Magic-move: bare `createServerFn` → `.validator` → `.handler`.

**SAY:** "Start with server functions. This is `getStats`. It's an explicit RPC
boundary — method up front, (CLICK) a validator that runs first, (CLICK) then a
handler. The key word is _typed_: I can call this from a loader, from a hook, from a
component, and the input and output are checked end to end. And notice the method —
this one's a `GET`, so the RPC is HTTP-cacheable. Next's Server Actions are POST-only.
It's not a magic string endpoint; it's a function with a contract."

---

## 18 · The part Next does not have ⏱ 10:45

> Magic-move: bare middleware → `.client()` → `.server()`.

**SAY:** "And here's the beat I most want you to take home — the part Next doesn't
have. Server-function middleware that has a client half and a server half. (CLICK)
The `.client()` side runs in the browser and can attach context before the call
leaves; (CLICK) the `.server()` side runs on the server and composes its own context
in. The handler receives the merged, typed result. That's not a lifecycle hook — it's
one middleware that spans the network. And that's the _per-function_ tier — there's
also request middleware that runs for every request. Next has a single edge
`middleware.ts` that can't even reach a database."

---

## 19 · Live: client → middleware → server ⏱ 11:30

> In-deck demo. Calls the real `getBoundarySnapshot` server function from the browser.

**[DEMO]** "Let me prove it isn't a slide." Point at the panel. "(CLICK) These values
came from the server function during render. I press the button — same function, now
from the browser — and watch the request id change and the server-only context appear.
Client, to middleware, to server, one boundary. And that 'server-only fn' string? It
was produced on the server and never shipped to the client."

**[FALLBACK]** If the button doesn't refresh, the values are already on screen — point
at `request id` and `server-only fn`. Or re-advance to this slide to re-run it.

---

## 20 · Loader data is cached ⏱ 12:15

**SAY:** "Next feature — and remember, on the Next side, caching was one of my
gripes: it became this surface you had to manage — the `fetch` cache, `use cache`,
`revalidateTag`, knowing which one was in play. (CLICK) In Start it's just the
router's built-in stale-while-revalidate. You set a `staleTime`, and that's it.
Navigating away and back is _instant_ while it quietly refreshes in the background.
No React Query wiring — though if you want it, the same loader can `ensureQueryData`
from the Query client you already use at work. The blog caches a post for a day,
`/stats` for five minutes. Same dial, per route."

---

## 21 · Rendering is a dial ⏱ 13:00

> Magic-move: full SSR → `ssr: "data-only"` → `ssr: false`.

**SAY:** "Rendering is a dial, not a doctrine. Same route API: (CLICK) one route is
full SSR, (CLICK) the next is data-only, (CLICK) the next is client-only. You're not
fighting a framework default route by route — you're turning a knob the framework
hands you."

> 🗳 **Second live poll fires here (slide 21).** "Which rendering mode fits your app?"
> Let it run while you set up the streaming demo.

---

## 22 · Streaming SSR ⏱ 13:45

> Magic-move: un-awaited loader promise → `<Suspense>` + `<Await>`.

**SAY:** "And if you've been waiting for the Next.js Partial Prerendering comparison,
here's the honest version. This is the _streaming_ half of PPR — the part that makes
dynamic content feel instant — without a proprietary API. (CLICK) You return a promise
from the loader and you _don't_ await it. (CLICK) On the client it's just `<Suspense>`
and `<Await>`. Start flushes the page shell immediately, and streams the slow part
into the _same_ HTTP response when it resolves. The one difference I'll own: the shell
here is server-rendered per request, not a prebuilt static shell the way PPR's is."

---

## 23 · Live: shell now, slow data later ⏱ 14:30

> In-deck demo. A real server round-trip with a deliberate ~1.2s delay so the
> skeleton→panel transition is visible on a projector.

**[DEMO]** "(CLICK) Shell and skeleton paint instantly — now watch — the panel fills
in about a second later. I slowed that on purpose so you can see it; the real `/stats`
page does the exact same thing, just faster. Press 'Stream again' to re-run it."

> **Honesty note:** in the deck this fires as a client-initiated server call, not the
> true server-streamed-into-shell variant. If anyone inspects, say so — `/stats` shows
> the real loader-deferred version in production.

**[FALLBACK]** If the timing's awkward, switch to `/stats` — the dashboard chrome
renders before the numbers arrive. Same mechanism, in production.

---

## 24 · Build-time server functions ⏱ 15:15

**SAY:** "One more on server functions — because it's the _same_ primitive on a
different clock. With static middleware, `getHighlightedCode` here runs at _build_
time and ships static data — so `/rwc` does its server work once, during the build, and
serves it as plain JSON forever. Same `createServerFn`, no request-time cost."

---

## 25 · One connected example ⏱ 16:15

> Magic-move: server function with middleware → the route wiring SSR + streaming +
> caching → the component consuming both. This is illustrative, but it's exactly the
> shape of the real pages on the site.

**SAY:** "Now let me show all of that composing, because that's the point — not five
disconnected features, one route. (CLICK) Here's a server function with a validator
and middleware that has a client half and a server half. (CLICK) The route wires it
up: typed search params, a loader that `await`s the snapshot for SSR _and_ returns an
un-awaited streaming promise, and a `staleTime` so it's cached. (CLICK) And the
component just reads loader data — the shell renders now, the deferred panel streams
in later. That's server functions, middleware, SSR, streaming, and caching, in one
file."

---

## 26 · I used to be anti-TypeScript ⏱ 17:00

> Personal credibility beat — don't rush it. The "anti-TS" framing hooks anyone
> who's felt type-fest pain.

**SAY:** "Okay — a confession before I get to the type system. I used to be
anti-TypeScript. (CLICK) At React Nexus _last year_, I was in a corridor debate with a
bunch of engineers — I remember some folks from Razorpay — about TypeScript. (CLICK)
The benefits are obvious: it catches bugs, it helps maintain code as it grows. (CLICK)
but on any moderately-sized project, the types become a whole dimension you wrangle
continuously. (CLICK) You know exactly what I mean if you've ever reached for
`type-fest`. (CLICK) …so I came around. Start's end-to-end types won me over — and let
me show you why, with my own code."

---

## 27 · Type safety, the old way vs. Start ⏱ 17:45

> Magic-move + Steps. The "before" code is real, pulled from this repo's git history.

**SAY:** "This is real code from my repo. (CLICK) In Next Pages Router, I had to
hand-write a `FoobarPageQuery extends ParsedUrlQuery` interface _just_ so
`getStaticProps`'s `params` had a type — plus `params!` with an eslint-disable to
silence the non-null assertion. (CLICK) In the App Router, every single page
redeclares `type PageParams = { params: Promise<{ slug: string }> }` and `await`s it
by hand — there's no shared type, each route writes its own. (CLICK) In Start, one
`validateSearch` schema — the route owns it — and `useSearch()` hands me back a typed
`PlausibleDateRange`. No `as` casts. No `params!`. The URL is typed state."

---

## 28 · URL state is not a string bag ⏱ 18:30

> Magic-move build-up: bare route → `validateSearch` → `loaderDeps`.

**SAY:** "Which is the payoff. In a lot of apps, search params are a bag of strings,
and every page re-parses them and re-validates them and hopes. In Start, the route
owns the URL as state — with a schema. (CLICK) `validateSearch` parses it once.
(CLICK) And `loaderDeps` says exactly which part of that state the loader depends on.
So invalidation is explicit, not vibes."

---

## 29 · Demo: /stats ⏱ 19:15

**[DEMO]** Advance to the demo slide (or cut to the `/stats` tab).

**SAY:** "Here's the real stats page. (CLICK) Watch — I'll feed it garbage:
`?period=nonsense`. (CLICK) The route doesn't blow up; it falls back to a safe
default. (CLICK) And in the code, `Route.useSearch()` hands me a typed
`PlausibleDateRange`, not 'some string'. (CLICK) Because `loaderDeps` keys off the
parsed value, the data fetch only re-runs when the thing it actually depends on
changes."

**[FALLBACK]** If the tab is stale, just say it from the code in the editor —
`validateSearch` → safe default; the point is the type, not the network.

---

## 30 · Live: this deck's URL state ⏱ 19:45

> In-deck demo. This panel reads the deck's _own_ validated search params live.

**SAY:** "And I don't even need to leave the deck for it. This panel is reading this
deck's own URL state — `slide`, `step`, `live`, `presenter` — all validated by the
same `validateSearch`. Watch the numbers as I move. (CLICK a step) That's not a string
bag; that's a typed schema the route owns. Feed it `?slide=banana` and it coerces away
instead of breaking the deck."

**Transition:** "So the URL is typed. Now the richest server feature — server
components."

---

## 31 · RSC as an opt-in data primitive ⏱ 20:45

> Magic-move: JSX subtree → `renderServerComponent` → returned as loader data.

**SAY:** "React Server Components — but as a _tool_, not a religion. On the blog, the
loader server-renders the heavy MDX subtree with `renderServerComponent`, (CLICK) and
hands the result through loader data like any other value. (CLICK) Then I compose
client islands — Sparkles, a highlighter — on top of it. RSC here is a way to render
expensive content on the server and pass it down. It is data. And to be straight with
you: RSC is still _experimental_ in Start — I run it in production on this site anyway."

---

## 32 · This is not "RSC-first" ⏱ 21:30

**SAY:** "And that's the distinction. This is not 'RSC-first.' In Start, an ordinary
React component is interactive by default — you opt _into_ the server, not out of it.
(CLICK) Use RSC when it buys you something. (CLICK) Cache it like route data. (CLICK)
Pass it through the loader. (CLICK) And keep the client in charge of composition. The
mental model never inverts on you — which is exactly the thing that bugged me about
server-first."

---

## 33 · Live: a server subtree as data ⏱ 22:15

> In-deck demo. `renderServerComponent` round-trips via a server function and renders
> next to an interactive client island.

**[DEMO]** Point at the bordered panel. "Everything in this bordered block was produced
on the server by `renderServerComponent` — the timestamp, the request agent, a
server-only string that never ships to the browser. And right next to it (CLICK) is an
ordinary client counter, hydrated and interactive. The client composes _around_ server
output; it doesn't opt out of it."

**[FALLBACK]** If the panel doesn't render, re-advance to this slide to re-run the
round-trip.

---

## 34 · Composite components: slots ⏱ 23:15

> Magic-move: renderable (no slots) → `createCompositeComponent` with a slot → the
> client filling the slot.

**SAY:** "Now the piece that really closes the loop — composite components, or 'slots.'
Remember that App Router footgun, where a client import silently dragged the whole
server subtree onto the client? Composite slots are the clean inverse. (CLICK) Plain
`renderServerComponent` gives you finished markup — you can drop it in, but you can't
compose _into_ it. (CLICK) `createCompositeComponent` makes the function props into
slots: the server tree stays on the server, and it hands typed data _out_ to a slot.
(CLICK) The client fills that slot with an interactive island. Server wraps client,
explicitly, and typed. (beat) Two honest edges: on the server the slots are opaque —
`React.Children.map` won't work, you use render props — and the data you pass out has
to be serializable, because it crosses React's Flight protocol. And like RSC, this is
experimental into early v1. I still run it here."

---

## 35 · Live: composite slots ⏱ 24:15

> In-deck demo. `createCompositeComponent` round-trips a composite source; the client
> fills a render-prop slot (fed server data) and a children slot.

**[DEMO]** Point at the card. "This whole card was built by `createCompositeComponent`
on the server. (CLICK) The 'client island' box inside it? That's a render-prop slot —
it's client React, but the request id and render time it's showing came _from the
server_. And the 'Client clicks' button is the `children` slot: plain interactivity,
no server data. The server never imported those client bits; it just left slots open."

**[FALLBACK]** If the composite round-trip errors (it's RC-stage RSC), fall back to the
code build-up on the previous slide — the shape is the point, not the network.

**Transition:** "So that's the server, available every way you'd want it. Two things
left: the ecosystem it lives in, and where it runs."

---

## 36 · TanStack + Vite ⏱ 25:00

**SAY:** "None of this is a walled garden. (CLICK) Router, Query, Table, Start — the
same headline primitives, and they compose together. (CLICK) The TanStack Query and
Table I mentioned I use at work — plus TanStack DB — it's one composable, headless
stack. (CLICK) And it's built on Vite: an open ecosystem with real plugins, not a
bespoke bundler you can't see into. (CLICK) With first-class TypeScript holding across
all of it. That's the part that made adopting Start feel like coming home rather than
starting over."

---

## 37 · The dev loop, every day ⏱ 25:45

**SAY:** "And this is the Vite pillar paying off every single day. It's not a code
feature, it's a productivity one. I ship Next for a living, and the thing I miss most
on Start days is just… gone. (CLICK) Vite: the dev server is up almost immediately.
(CLICK) HMR is basically instant. (CLICK) Navigation in dev isn't throttled. (CLICK)
And my laptop fan stays off. I won't oversell it — but it compounds."

> Keep this to ~30–40s. It's a credibility beat, not a benchmark slide.

---

## 38 · Deployment is part of the design ⏱ 26:30

**SAY:** "And deployment isn't an afterthought — it's the deploy-anywhere pillar
paying off. This site runs on Cloudflare Workers. (CLICK) D1 for views and likes.
(CLICK) KV for runtime storage. (CLICK) Durable Objects for presence and for the live
slides. (CLICK) Smart Placement, logs, traces, version metadata. (CLICK) Same route
model — different runtime. I didn't rewrite the app to move it to the edge."

---

## 39 · How to start ⏱ 27:15

> One slide, ~40s. Show the on-ramp is shallow and additive.

**SAY:** "So how do you actually start? (CLICK) `npm create @tanstack/start` scaffolds
a route tree with the CLI. (CLICK) `pnpm dev` — Vite is up almost immediately. (CLICK)
Add a server function, a `validateSearch`, a loader — incrementally, not all at once.
(CLICK) And the mental model never inverts: you opt _into_ the server, you don't opt
out of it. If you're migrating from Next — route by route. Quick shoutouts while I'm
here: to Elixir, the backend that made me comfortable trusting a real type system, and
to Cloudflare, the runtime that made 'deploy anywhere' actually true for me."

---

## 40 · Finale: live slides are the demo ⏱ 28:15

**SAY:** "Which brings us all the way back to this deck — because everything you've
watched is one TanStack Start route, and that includes a live session you've been in
this whole time. (CLICK) The slide we're on is URL state; the session is running right
now. (CLICK) I control navigation; your screens follow mine. (CLICK) You've voted in
two polls. (CLICK) Reactions ride over hibernatable WebSockets, and one session id maps
to exactly one Durable Object — the same primitive as the presence counter on my site."

**[DEMO]** Trigger a reaction from your phone (or invite one) so the room sees it
land on the projected deck. "That heart came from a phone, through a Durable Object,
onto this screen, in real time. Six rewrites in — this is the one I'd start with. The
talk _is_ the deployment proof. Thank you."

**[FALLBACK]** If the socket dropped, show the poll _results_ you already collected —
those round-tripped through the same DO.

**[CLOSE]** Leave the deck up. Take questions against the live session so the last
thing they see is the thing working.

---

## If you're running long (cut list, in order)

1. Slide 24 (build-time functions) — fold into one sentence on slide 20 (caching) or drop.
2. Slide 37 (dev loop) — fold into one line on the ecosystem slide (36).
3. Slide 32 — fold into slide 31.
4. The `/stats` editor dive (slide 29) — keep the bad-URL click, drop the code read.
5. Slide 16 (client-first list) — fold into the connected example (25) if the opening ran long.

## If you're running short (expand)

- On slide 18/19, open `-boundary.server.ts` and trace the middleware halves live.
- On slide 34/35, open `-composite.server.tsx` and show the render-prop slot receiving
  server data.
- On slide 22/23, open `-streaming.server.ts` and show the deliberate delay, then talk
  through the un-awaited loader promise on a real page.
- On slide 40, open `SlideSessionDurableObject.ts` and show the one-DO-per-session line.

## Demo cheat sheet (fallbacks)

- Typed URL state / safe defaults — `/stats` and `/stats?period=nonsense`
- Streaming SSR in production — `/stats` (shell renders before the numbers)
- Every other demo is a slide in the deck — re-advance to it to re-run.
- Live session (presenter) — deck with `?live=<id>&master=1`

## Likely Q&A (have these ready)

- **"Is it production-ready?"** It's a Release Candidate — feature-complete, stabilizing
  toward v1. This site runs on it. I'd ship it for a greenfield app; I'd weigh the RSC
  maturity gap for an RSC-heavy one.
- **"Why not just Next?"** I ship Next at work and would still pick it for the
  RSC ecosystem, image/font optimization, and hiring. Start wins on type-safety,
  deployment portability, the dev loop, and explicit middleware.
- **"What about React Router v7?"** Same Vite-era DX and web-standards story; Start's
  edge is end-to-end type safety and the client+server function middleware.
- **"Does the caching replace React Query?"** For loader data, often yes. When you need
  Query's full feature set, the loader can `ensureQueryData` and share the cache.
- **"Is RSC the same as Next's?"** No — Start treats server components as data the
  client fetches and composes (and composite slots let the client fill server-owned
  slots), and it's still experimental.
- **"Six or seven versions — which is it?"** Honestly? I've lost count. That's the joke,
  and also the point: it's the one project I keep coming back to.
