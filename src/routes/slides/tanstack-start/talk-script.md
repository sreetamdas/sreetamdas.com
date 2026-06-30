<!--
notes

https://tanstack.com/blog/tanstack-open-source-awards-2026
RSC first teased: https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components


-->

# TanStack Start — talk script

Read-aloud script for the deck at `/slides/tanstack-start`. Paste straight into
Notion (headings/callouts survive). Target run time **~32 min**.

**Legend**

- **SAY** — spoken lines, written the way you'd actually say them (read, don't recite).
- **(CLICK)** — advance one `<Steps>` reveal, one magic-move state, or one slide.
- **[DEMO]** — do the live thing. Most demos are now slides _in the deck_ — you advance to them.
- **[FALLBACK]** — what to say/show if the live demo misbehaves. Always have this ready.
- **⏱** — cumulative target time.

> Section numbers below are **deck-absolute slide indices** (the `?slide=N` value),
> so they match the live-session counter and `-live-polls.ts` exactly. The title
> build is slides 0–3.
>
> One global rule: **the demos live in the deck now.** Where it used to say "switch
> to the showcase," you just click to the next slide. The standalone
> `…/showcase?feature=…` route is your **fallback** if an in-deck demo misbehaves.

---

## Pre-flight (before you're mic'd)

- Deck open at `?slide=0`, in a window joined to the **live session**
  (`?live=<id>&master=1`). Hard-refresh once; confirm the poll overlay connects.
- Phone on the live session as an audience member, so you can show a vote/reaction land.
- Fallback tabs, in order, in a second window: `/stats` · `/stats?period=nonsense` ·
  `…/showcase?feature=server` · `…?feature=rsc` · `…?feature=streaming` ·
  `…?feature=rendering`. Only needed if an in-deck demo stalls.
- Editor open on the "show the code" files:
  `stats/route.tsx`, `stats/-stats.server.ts`, `showcase/-showcase.server.ts`,
  `showcase/-rsc.server.tsx`, `showcase/-streaming.server.ts`,
  `SlideSessionDurableObject.ts`.
- Walk the RSC and streaming demo slides once so their server functions are warm,
  not cold (the streaming one is deliberately ~1.2s).

---

## 0–3 · Title build ⏱ 0:00

> The animated title is intentional — let it breathe. Slide 0 shows the full
> title; the build strips it back and rebuilds it.

**SAY:** "Hello, good morning everyone! It is genuinely so awesome to be here at
React Nexus — in front of, and honestly among, so many speakers I've learned from.
(CLICK) I gave my first talk back in 2021, so this is a bit of a full-circle moment
for me. (CLICK) Today, I want to talk to you about TanStack Start."

---

## 4 · Sreetam Das ⏱ 1:00

**SAY:** "Quick intro: I'm Sreetam. I'm a Senior Frontend Engineer on the Web
Experience team at Remote. And — full disclosure — I build _way_ too many things on
my personal website. Which is the thing you're looking at right now: this whole deck
is just a route on it."

---

## 5 · Six versions in. Maybe seven. ⏱ 1:45

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

## 6 · Remote (sponsor) ⏱ 2:45

**SAY:** "One quick word on Remote, who's making this possible. Remote helps companies
hire, manage, and pay people anywhere in the world. (CLICK) Full-time, contractors,
payroll. (CLICK) No offices. (CLICK) And yes — I work remotely, for Remote. (CLICK)
And yes, we get the TV-remote questions. Every time."

**Notes for you:** Global employment is genuinely hard — different laws, taxes,
payroll, compliance in every country. Remote owns entities and in-house legal/payroll
in each market so you don't stitch it together yourself. Keep this to ~20 seconds.

---

## 7 · Engineering at Remote ⏱ 3:30

**SAY:** "For context on where my instincts come from: I've been at Remote since
2020 — four years in Growth Engineering, now Web Experience. We're around 300
engineers, ~50 teams, 40-plus countries. The backend is millions of lines of Elixir.
And the frontend is Next.js as an SPA, with TanStack Query and TanStack Table doing
the heavy lifting. So when I compare Start to Next today, it's not theoretical — I
ship Next for a living."

---

## 8 · Next.js is the benchmark ⏱ 4:30

**SAY:** "And let's be honest about the benchmark, which is Next. It's really common
to dunk on Next.js — I'll try not to do too much of that, because the truth is Next
is the bar everything else is measured against. (CLICK) I was genuinely _hyped_ when
React Server Components were first teased — December 2020. (CLICK) And that excitement
carried right through when Next 13 shipped them with the App Router. (CLICK) Layouts
are a genuinely great idea — a clean way to share data and rendering across pages.
(CLICK) And you stopped needing API routes just to talk to your own server. That was
a big deal."

---

## 9 · But the model flipped ⏱ 5:30

**SAY:** "But here's where it got complicated for me. The App Router flipped the
rendering model: components are server-first _by default_. (CLICK) So `"use client"`
ended up everywhere you wanted state, or interactivity, or an effect. (CLICK) You're
writing React kind of backwards from how we'd always written it — which was
client-first. (CLICK) And the thing I kept feeling: the server stops being a tool you
pick up, and the whole app starts getting built _around_ it. I didn't want the server
to be mandatory. I wanted it to be _available_."

> Don't crap on it — App Router is good. The point is the inversion, not a bug.

---

## 10 · Start's bet: the server, opt-in ⏱ 6:30

**SAY:** "And that's Start's bet, in one line: you don't build the app around the
server — the server is just _there_, wherever and whenever you reach for it. It's
opt-in, not the architecture. (CLICK) On top of that, three things I love: you deploy
anywhere — there's no first-party host quietly shaping the framework. (CLICK)
TypeScript is first-class, end to end. (CLICK) And my favourite — it's built on Vite.
An open ecosystem, real plugins. We'll see all three pay off later; hold onto them."

---

## 11 · The premise ⏱ 7:30

**SAY:** "So here's my premise for the next half hour. (CLICK) This deck is a TanStack
Start route. (CLICK) What slide we're on is URL state. (CLICK) The live polls we'll
run are Durable Objects. (CLICK) And there's a companion page that maps every claim I
make to a real file in the repo. The website is the demo. If I say Start can do
something, I'll show you the line that does it."

> 🗳 **Live poll fires here (slide 11).** "Have you tried TanStack Start yet?" Let
> them vote; read the room out loud ("okay, mostly 'not yet' — perfect, this is for you").

---

## 12 · Start's pitch in one sentence ⏱ 8:30

**SAY:** "If I had to compress Start into one sentence: router-first React, with the
server added where it helps. The router is the spine, and everything else is opt-in.
(CLICK) You type the URL. (CLICK) You type the loader. (CLICK) You type the server
boundary. (CLICK) You pick rendering per route. (CLICK) And you deploy to the runtime
you actually want. Hold onto that shape — the rest of the talk is just those five
things, with the real code."

---

## 13 · Map of the app ⏱ 9:15

**SAY:** "Quick map so you can follow along — every row here is a real feature of
this site and the file behind it. Typed URL state, server functions, cached loader
data, RSC as data, streaming, build-time functions, server routes, and Cloudflare
primitives. I'm not going to read the table; I'm going to walk down it. This is our
agenda."

> Don't dwell — this is a glance slide. ~30s.

---

## 14 · 1. URL state is not a string bag ⏱ 9:45

> This slide is a magic-move build-up: bare route → `validateSearch` → `loaderDeps`.
> Each (CLICK) morphs the code; let the lines land before you talk over the next one.

**SAY:** "Feature one. In a lot of apps, search params are a bag of strings, and
every page re-parses them and re-validates them and hopes. In Start, the route owns
the URL as state — with a schema. (CLICK) `validateSearch` parses it once. (CLICK)
And `loaderDeps` says exactly which part of that state the loader depends on. So
invalidation is explicit, not vibes."

---

## 15 · Demo: /stats ⏱ 10:45

**[DEMO]** Switch to the `/stats` tab.

**SAY:** "This is the real stats page. (CLICK) Watch — I'll feed it garbage." Switch
to the pre-opened `?period=nonsense` tab. "(CLICK) The route doesn't blow up; it
falls back to a safe default. (CLICK) And in the code, `Route.useSearch()` hands me
a typed `PlausibleDateRange`, not 'some string'. (CLICK) Because `loaderDeps` keys
off the parsed value, the data fetch only re-runs when the thing it actually depends
on changes."

**[FALLBACK]** If the tab is stale, just say it from the code in the editor —
`validateSearch` → safe default; the point is the type, not the network.

---

## 16 · Live: this deck's URL state ⏱ 11:30

> In-deck demo. This panel reads the deck's _own_ validated search params live.

**SAY:** "And I don't even need to leave the deck for it. This panel is reading this
deck's own URL state — `slide`, `step`, `live`, `presenter` — all validated by the
same `validateSearch`. Watch the numbers as I move. (CLICK a step) That's not a string
bag; that's a typed schema the route owns. Feed it `?slide=banana` and it coerces away
instead of breaking the deck."

**[FALLBACK]** If the values look stuck, move a step and back — the point is they're
typed and live, not the exact value.

**Transition:** "So the URL is typed. Now the server boundary."

---

## 17 · 2. Server functions are typed RPC ⏱ 12:30

> Magic-move: bare `createServerFn` → `.validator` → `.handler`.

**SAY:** "Feature two: server functions. This is `getStats`. It's an explicit RPC
boundary — method up front, (CLICK) a validator that runs first, (CLICK) then a
handler. The key word is _typed_: I can call this from a loader, from a hook, from a
component, and the input and output are checked end to end. And notice the method —
this one's a `GET`, so the RPC is HTTP-cacheable. Next's Server Actions are POST-only.
It's not a magic string endpoint; it's a function with a contract."

---

## 18 · The part Next does not have ⏱ 13:30

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

## 19 · Live: client → middleware → server ⏱ 14:30

> In-deck demo. Calls the real `getShowcaseSnapshot` server function from the browser.

**[DEMO]** "Let me prove it isn't a slide." Point at the panel. "(CLICK) These values
came from the server function during render. I press the button — same function, now
from the browser — and watch the request id change and the server-only context appear.
Client, to middleware, to server, one boundary. And that 'server-only fn' string? It
was produced on the server and never shipped to the client."

**[FALLBACK]** If the button doesn't refresh, the values are already on screen — point
at `request id` and `server-only fn`. Or open `…/showcase?feature=server` as backup.

---

## 20 · 3. Loader data is cached ⏱ 15:45

**SAY:** "Feature three — and this is the one the TanStack docs lead with, and the
one I most underuse when I talk about Start. Your loader data is cached, for free.
(CLICK) Every route here sets a `staleTime`. The router keeps that data
stale-while-revalidate, so navigating away and back is _instant_ while it quietly
refreshes in the background. (CLICK) No React Query wiring needed — though if you
want it, the same loader can `ensureQueryData` from the Query client you already use
at work. The blog caches a post for a day, `/stats` for five minutes, this showcase
for thirty seconds. Same dial, turned per route."

**Transition:** "And one of the things you can cache is a server-rendered React tree."

---

## 21 · 4. RSC as an opt-in data primitive ⏱ 16:45

> Magic-move: JSX subtree → `renderServerComponent` → returned as loader data.

**SAY:** "Feature four: React Server Components — but as a _tool_, not a religion.
On the blog, the loader server-renders the heavy MDX subtree with
`renderServerComponent`, (CLICK) and hands the result through loader data like any
other value. (CLICK) Then I compose client islands — Sparkles, a highlighter — on top
of it. RSC here is a way to render expensive content on the server and pass it down.
It is data. And to be straight with you: RSC is still _experimental_ in Start — I run
it in production on this site anyway."

---

## 22 · This is not "RSC-first" ⏱ 17:30

**SAY:** "And that's the distinction. This is not 'RSC-first.' In Start, an ordinary
React component is interactive by default — you opt _into_ the server, not out of it.
(CLICK) Use RSC when it buys you something. (CLICK) Cache it like route data. (CLICK)
Pass it through the loader. (CLICK) And keep the client in charge of composition. The
mental model never inverts on you — which is exactly the thing that bugged me about
server-first."

---

## 23 · Live: a server subtree as data ⏱ 18:15

> In-deck demo. `renderServerComponent` runs on the server, round-trips via a server
> function, and renders next to an interactive client island.

**[DEMO]** Point at the bordered panel. "Everything in this bordered block was produced
on the server by `renderServerComponent` — the timestamp, the request agent, a
server-only string that never ships to the browser. And right next to it (CLICK) is an
ordinary client counter, hydrated and interactive. The client composes _around_ server
output; it doesn't opt out of it."

**[FALLBACK]** If the panel doesn't render, open `…/showcase?feature=rsc`. Same demo,
standalone route.

**Transition:** "Which leads to the thing I like most about Start: rendering is a
choice you make per route."

---

## 24 · 5. Rendering is a dial ⏱ 19:15

> Magic-move: full SSR → `ssr: "data-only"` → `ssr: false`.

**SAY:** "Feature five. Rendering is a dial, not a doctrine. Same route API: (CLICK)
one route is full SSR, (CLICK) the next is data-only, (CLICK) the next is client-only.
You're not fighting a framework default route by route — you're turning a knob the
framework hands you."

> 🗳 **Second live poll fires here (slide 24).** "Which rendering knob feels most
> useful?" Let it run while you set up the next demo.

---

## 25 · 6. Hydration can wait ⏱ 20:30

**SAY:** "Feature six. Rendering and hydration are different costs, and people
conflate them constantly. The HTML can be in the document _now_; the JavaScript
does not have to be. Here I wrap a below-the-fold chart in `Hydrate when visible` —
it server-renders into the page, but it doesn't load and hydrate its JS until it's
near the viewport."

**[DEMO]** Switch to `…/showcase?feature=rendering`, scroll to the hydration island.
"(CLICK) View source — the markup is right there, indexable, styled. But that
counter only starts counting after it scrolls into view and hydrates. HTML now,
JavaScript later, on purpose."

**[FALLBACK]** If scroll/timing is awkward, say the line and move — "meaningful HTML
without paying for hydration up front" is the whole point.

---

## 26 · 7. Streaming SSR (the honest PPR comparison) ⏱ 21:45

> Magic-move: un-awaited loader promise → `<Suspense>` + `<Await>`.

**SAY:** "Feature seven — and if you've been waiting for the Next.js Partial
Prerendering comparison, here's the honest version. This is the _streaming_ half of
PPR — the part that makes the dynamic content feel instant — without a proprietary
API. (CLICK) You return a promise from the loader and you _don't_ await it. (CLICK)
On the client it's just `<Suspense>` and `<Await>`. Start flushes the page shell
immediately, and streams the slow part into the _same_ HTTP response when it resolves.
The one difference I'll own: the shell here is server-rendered per request, not a
prebuilt static shell the way PPR's is."

> If a Next expert presses: PPR's signature is the _build-time static shell_ served
> from the edge; you only have the streaming half. Concede it cleanly — same payoff.

---

## 27 · Live: shell now, slow data later ⏱ 22:45

> In-deck demo. A real server round-trip with a deliberate ~1.2s delay so the
> skeleton→panel transition is visible on a projector.

**[DEMO]** "(CLICK) Shell and skeleton paint instantly — now watch — the panel fills
in about a second later. I slowed that on purpose so you can see it; the real `/stats`
page does the exact same thing, just faster. Press 'Stream again' to re-run it."

> **Honesty note:** in the deck this fires as a client-initiated server call, not the
> true server-streamed-into-shell variant. If anyone inspects, say so — `/stats` and
> `…/showcase?feature=streaming` show the real loader-deferred version.

**[FALLBACK]** If the timing's awkward, switch to `/stats` — the dashboard chrome
renders before the numbers arrive. Same mechanism, in production.

---

## 28 · 8. Build-time server functions ⏱ 23:45

**SAY:** "Feature eight, quickly. A server function doesn't have to run at request
time. With static middleware, `getHighlightedCode` here runs at _build_ time and
ships static data — so `/rwc` does its server work once, during the build, and serves
it as plain JSON forever. Same primitive, different clock."

---

## 29 · 9. Deployment is part of the design ⏱ 24:45

**SAY:** "Feature nine: deployment isn't an afterthought you bolt on — it's part of
the design, and it's the first pillar from earlier paying off. This site runs on
Cloudflare Workers. (CLICK) D1 for views and likes. (CLICK) KV for runtime storage.
(CLICK) Durable Objects for presence and for the live slides. (CLICK) Smart Placement,
logs, traces, version metadata. (CLICK) Same route model — different runtime. I didn't
rewrite the app to move it to the edge."

---

## 30 · The dev loop, every day ⏱ 25:30

**SAY:** "One more before the finale — and this is the Vite pillar paying off. This
one isn't a code feature, it's a daily one. I ship Next for a living, and the thing I
miss most on Start days is just… gone. (CLICK) Vite: the dev server is up almost
immediately. (CLICK) HMR is basically instant. (CLICK) Navigation in dev isn't
throttled. (CLICK) And my laptop fan stays off. I won't oversell it — but it compounds,
every single day."

> Keep this to ~30–40s. It's a credibility beat, not a benchmark slide.

---

## 31 · Finale: live slides are the demo ⏱ 27:30

**SAY:** "Which brings us all the way back to this deck. It has a live session mode,
and you've been in it the whole time. (CLICK) I control navigation; your screens
follow mine. (CLICK) You've voted in two polls. (CLICK) Reactions ride over
hibernatable WebSockets. (CLICK) And one session id maps to exactly one Durable
Object — the same primitive as the presence counter on my site."

**[DEMO]** Trigger a reaction from your phone (or invite one) so the room sees it
land on the projected deck. "That heart came from a phone, through a Durable Object,
onto this screen, in real time. The talk _is_ the deployment proof."

**[FALLBACK]** If the socket dropped, show the poll _results_ you already collected —
those round-tripped through the same DO.

---

## 32 · Where Next still wins ⏱ 29:00

**SAY:** "Now — be honest, or nobody trusts the comparison. Here's where Next still
wins today. (CLICK) RSC ecosystem maturity — and remember, it's experimental in
Start. (CLICK) `<Form>` and Server Action form ergonomics. (CLICK) Built-in image
and font optimization. (CLICK) ISR and PPR that are automatic on Vercel — Start can
do ISR with cache headers, but Next's is turnkey. (CLICK) Ecosystem size and hiring
familiarity, which is real. (CLICK) And Start is still a Release Candidate. If you
need any of that tomorrow, Next is the safer bet, and I'll say that to my own team."

---

## 33 · The tradeoff ⏱ 30:15

**SAY:** "So it's a tradeoff, not a winner. Next gives you a platform-shaped happy
path — it's paved, and it's fast if you stay on it. Start gives you app-shaped
primitives. (CLICK) More explicit. (CLICK) More type-driven. (CLICK) More portable.
(CLICK) More control over where React actually runs. You're trading some paving for
a lot of control."

---

## 34 · Takeaways ⏱ 31:30

**SAY:** "If you forget everything else, five lines. Your route tree can be your
application contract. The server boundary can be typed, validated, and
middleware-aware. RSC can be a tool, not the architecture. Rendering — and caching,
and streaming — can be dials, not defaults you fight. And the website itself can be
the demo. Six rewrites in, this is the one I'd start with. Thank you."

**[CLOSE]** Leave the deck up. Take questions against the live session so the last
thing they see is the thing working.

---

## If you're running long (cut list, in order)

1. Slide 28 (build-time functions) — mention in one sentence on slide 29.
2. Slide 30 (dev loop) — fold into one line on the tradeoff slide (33).
3. Slide 22 — fold into slide 21.
4. The `/stats` editor dive (slide 15) — keep the bad-URL click, drop the code read.
5. Slide 20 (caching) — keep the spoken point, drop the `ensureQueryData` aside.
6. Slide 12 (pitch in one sentence) — fold into the map (13) if the opening ran long.

## If you're running short (expand)

- On slide 18/19, open `-showcase.server.ts` and trace the middleware halves live.
- On slide 26/27, open `-streaming.server.ts` and show the deliberate delay, then the
  un-awaited promise in `showcase/route.tsx`.
- On slide 31, open `SlideSessionDurableObject.ts` and show the one-DO-per-session line.

## Demo URLs (one-click cheat sheet — fallbacks)

- Typed URL state / safe defaults — `/stats` and `/stats?period=nonsense`
- Server-function middleware (client→server) — `…/showcase?feature=server`
- RSC as data (server subtree + client island) — `…/showcase?feature=rsc`
- Streaming SSR (skeleton → streamed panel) — `…/showcase?feature=streaming`
- Deferred hydration island — `…/showcase?feature=rendering`
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
  client fetches and composes, and it's still experimental.
- **"Six or seven versions — which is it?"** Honestly? I've lost count. That's the joke,
  and also the point: it's the one project I keep coming back to.
