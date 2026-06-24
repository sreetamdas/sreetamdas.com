# TanStack Start — talk script

Read-aloud script for the deck at `/slides/tanstack-start`. Paste straight into
Notion (headings/callouts survive). Target run time **~28–30 min**.

**Legend**

- **SAY** — spoken lines, written the way you'd actually say them (read, don't recite).
- **(CLICK)** — advance one `<Steps>` reveal or slide.
- **[DEMO]** — leave the deck / do the live thing.
- **[FALLBACK]** — what to say/show if the live demo misbehaves. Always have this ready.
- **⏱** — cumulative target time.

> One global rule: **never type a raw URL in front of the room if you can click instead.**
> Pre-open the tabs you need (listed in "Pre-flight") so every "demo" is one click.

---

## Pre-flight (before you're mic'd)

- Tabs open, in order: deck `?slide=0` · `/stats` · `/stats?period=nonsense` ·
  `/slides/tanstack-start/showcase?feature=server` · `…?feature=rendering` ·
  the deck again in a second window joined to the **live session** (`?live=<id>&master=1`).
- Phone on the live session as an audience member, so you can show a vote landing.
- Editor open on three files for the "show the code" beats:
  `stats/route.tsx`, `showcase/-showcase.server.ts`, `SlideSessionDurableObject.ts`.
- Hard-refresh the live-session window once; confirm the poll overlay connects.

---

## 0–4 · Title build ⏱ 0:00

> The animated title is intentional — let it breathe.

**SAY:** "Hi everyone. We're going to talk about TanStack Start — but I'm going to
do it backwards from most framework talks. (CLICK) No starter template. (CLICK)
No to-do app. (CLICK) I'm going to show you a real, in-production website — this
one — and the framework underneath it."

---

## 5 · Sreetam Das ⏱ 1:00

**SAY:** "Quick intro: I'm Sreetam. I'm a Senior Frontend Engineer on the Web
Experience team at Remote. And — full disclosure — I build way too many things on
my personal website, which is the thing you're looking at right now. This whole
deck is a route on it."

---

## 6 · Remote (sponsor) ⏱ 1:30

**SAY:** "One word on Remote, who's making this possible. Remote helps companies
hire, manage, and pay people anywhere in the world. (CLICK) Full-time, contractors,
payroll. (CLICK) No offices. (CLICK) And yes — I work remotely, for Remote. (CLICK)
And yes, we get the TV-remote questions. Every time."

**Notes for you:** Global employment is genuinely hard — different laws, taxes,
payroll, compliance in every country. Remote owns entities and in-house legal/payroll
in each market so you don't stitch it together yourself. Keep this to ~20 seconds.

---

## 7 · Engineering at Remote ⏱ 2:15

**SAY:** "For context on where my instincts come from: I've been at Remote since
2020 — four years in Growth Engineering, now Web Experience. We're around 300
engineers, ~50 teams, 40-plus countries. The backend is millions of lines of Elixir.
And the frontend is Next.js as an SPA, with TanStack Query and TanStack Table doing
the heavy lifting. So when I compare Start to Next today, it's not theoretical — I
ship Next for a living."

---

## 8 · The premise ⏱ 3:00

**SAY:** "Here's the premise. (CLICK) This deck is a TanStack Start route. (CLICK)
Its position — what slide we're on — is URL state. (CLICK) The live polls we'll run
are Durable Objects. (CLICK) And there's a companion page that maps every claim I
make to a real file in the repo. The website is the demo. If I say Start can do
something, I'll show you the line that does it."

> 🗳 **Live poll fires here.** "Have you tried TanStack Start yet?" Let them vote;
> read the room out loud ("okay, mostly 'not yet' — perfect, this is for you").

---

## 9 · Start's pitch in one sentence ⏱ 4:15

**SAY:** "If I had to compress Start into one sentence: router-first React, with the
server added where it helps. The router is the spine, and everything else is opt-in.
(CLICK) You type the URL. (CLICK) You type the loader. (CLICK) You type the server
boundary. (CLICK) You pick rendering per route. (CLICK) And you deploy to the runtime
you actually want. Hold onto that shape — the rest of the talk is just those five
things, with the real code."

---

## 10 · Map of the app ⏱ 5:15

**SAY:** "Quick map so you can follow along — every row here is a real feature of
this site and the file behind it. Typed URL state, server functions, RSC as data,
build-time functions, server routes, and Cloudflare primitives. I'm not going to
read the table; I'm going to walk down it. This is our agenda."

> Don't dwell — this is a glance slide. ~30s.

---

## 11 · 1. URL state is not a string bag ⏱ 5:45

**SAY:** "Feature one. In a lot of apps, search params are a bag of strings, and
every page re-parses them and re-validates them and hopes. In Start, the route owns
the URL as state — with a schema. `validateSearch` parses it once; `loaderDeps` says
exactly which part of that state the loader depends on. So invalidation is explicit,
not vibes."

---

## 12 · Demo: /stats ⏱ 6:30

**[DEMO]** Switch to the `/stats` tab.

**SAY:** "This is the real stats page. (CLICK) Watch — I'll feed it garbage." Switch
to the pre-opened `?period=nonsense` tab. "(CLICK) The route doesn't blow up; it
falls back to a safe default. (CLICK) And in the code, `Route.useSearch()` hands me
a typed `PlausibleDateRange`, not 'some string'. (CLICK) Because `loaderDeps` keys
off the parsed value, the data fetch only re-runs when the thing it actually depends
on changes."

**[FALLBACK]** If the tab is stale, just say it from the code in the editor —
`validateSearch` → safe default; the point is the type, not the network.

**Transition:** "So the URL is typed. Now the server boundary."

---

## 13 · 2. Server functions are typed RPC ⏱ 8:00

**SAY:** "Feature two: server functions. This is `getStats`. It's an explicit RPC
boundary — method up front, a validator that runs first, then a handler. The key
word is _typed_: I can call this from a loader, from a hook, from a component, and
the input and output are checked end to end. It's not a magic string endpoint; it's
a function with a contract."

---

## 14 · The part Next does not have ⏱ 9:00

**SAY:** "And here's the beat I most want you to take home — the part Next doesn't
have. Server-function middleware that has a client half and a server half. (CLICK)
The `.client()` side runs in the browser and can attach context before the call
leaves; the `.server()` side runs on the server and composes its own context in. The
handler receives the merged, typed result. That's not a lifecycle hook — it's one
middleware that spans the network."

**[DEMO]** "Let me prove it isn't a slide." Switch to
`showcase?feature=server`. "(CLICK) The panel on the right called this server
function during SSR. I press the button — same function, now from the browser —
and watch the request id change and the server-only context appear. Client, to
middleware, to server, one boundary."

**[FALLBACK]** If the snapshot doesn't refresh, the SSR values are still on screen —
point at `request id` and `server-only fn` and say "that string was produced on the
server and never shipped to the client."

---

## 15 · 3. RSC as an opt-in data primitive ⏱ 11:00

**SAY:** "Feature three: React Server Components — but as a _tool_, not a religion.
On the blog, the loader server-renders the heavy MDX subtree with
`renderServerComponent`, and hands the result through loader data like any other
value. (CLICK) Then I compose client islands — Sparkles, a highlighter — on top of
it. RSC here is a way to render expensive content on the server and pass it down. It
is data."

---

## 16 · This is not "RSC-first" ⏱ 12:00

**SAY:** "And that's the distinction. This is not 'RSC-first.' In Start, an ordinary
React component is interactive by default — you opt _into_ the server, not out of it.
(CLICK) Use RSC when it buys you something. (CLICK) Cache it like route data. (CLICK)
Pass it through the loader. (CLICK) And keep the client in charge of composition. The
mental model never inverts on you."

**Transition:** "Which leads to the thing I like most about Start: rendering is a
choice you make per route."

---

## 17 · 4. Rendering is a dial ⏱ 13:00

**SAY:** "Feature four. Rendering is a dial, not a doctrine. Same route API: one
route is full SSR, the next is data-only, the next is client-only. `ssr: false`,
`ssr: 'data-only'`, or the default. You're not fighting a framework default route by
route — you're turning a knob the framework hands you."

> 🗳 **Second live poll fires here.** "Which rendering knob feels most useful?"
> Let it run while you set up the next demo.

---

## 18 · 5. Hydration can wait ⏱ 14:30

**SAY:** "Feature five, and this is the one people conflate the most. Rendering and
hydration are different costs. The HTML can be in the document _now_; the JavaScript
does not have to be. Here I wrap a below-the-fold chart in `Hydrate when visible` —
it server-renders into the page, but it doesn't load and hydrate its JS until it's
near the viewport."

**[DEMO]** Switch to `showcase?feature=rendering`, scroll to the hydration island.
"(CLICK) View source — the markup is right there, indexable, styled. But that
counter only starts counting after it scrolls into view and hydrates. HTML now,
JavaScript later, on purpose."

**[FALLBACK]** If scroll/timing is awkward, say the line and move — "meaningful HTML
without paying for hydration up front" is the whole point.

---

## 19 · 6. Build-time server functions ⏱ 16:30

**SAY:** "Feature six, quickly. A server function doesn't have to run at request
time. With static middleware, `getHighlightedCode` here runs at _build_ time and
ships static data — so `/rwc` does its server work once, during the build, and serves
it as plain JSON forever. Same primitive, different clock."

---

## 20 · 7. Deployment is part of the design ⏱ 18:00

**SAY:** "Feature seven: deployment isn't an afterthought you bolt on — it's part of
the design. This site runs on Cloudflare Workers. (CLICK) D1 for views and likes.
(CLICK) KV for runtime storage. (CLICK) Durable Objects for presence and for the
live slides. (CLICK) Smart Placement, logs, traces, version metadata. (CLICK) Same
route model — different runtime. I didn't rewrite the app to move it to the edge."

---

## 21 · Finale: live slides are the demo ⏱ 20:00

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

## 22 · Where Next still wins ⏱ 22:30

**SAY:** "Now — be honest, or nobody trusts the comparison. Here's where Next still
wins today. (CLICK) RSC ecosystem maturity. (CLICK) `<Form>` and Server Action form
ergonomics. (CLICK) Built-in image and font optimization. (CLICK) PPR and ISR polish
on Vercel. (CLICK) And ecosystem size — and hiring familiarity, which is real. If you
need those tomorrow, Next is the safer bet, and I'll say that to my own team."

---

## 23 · The tradeoff ⏱ 24:00

**SAY:** "So it's a tradeoff, not a winner. Next gives you a platform-shaped happy
path — it's paved, and it's fast if you stay on it. Start gives you app-shaped
primitives. (CLICK) More explicit. (CLICK) More type-driven. (CLICK) More portable.
(CLICK) More control over where React actually runs. You're trading some paving for
a lot of control."

---

## 24 · Takeaways ⏱ 25:30

**SAY:** "If you forget everything else, five lines. Your route tree can be your
application contract. The server boundary can be typed, validated, and
middleware-aware. RSC can be a tool, not the architecture. Rendering can be a dial,
not a default you fight. And the website itself can be the demo. The companion
showcase is live at this URL — every claim, mapped to a file. Thank you."

**[CLOSE]** Leave the showcase link up. Take questions against the live deck so
the last thing they see is the thing working.

---

## If you're running long (cut list, in order)

1. Slide 19 (build-time functions) — mention in one sentence on slide 20.
2. Slide 16 — fold into slide 15.
3. The `/stats` editor dive — keep the bad-URL click, drop the code read.

## If you're running short (expand)

- On slide 14, open `-showcase.server.ts` and trace the middleware halves live.
- On slide 21, open `SlideSessionDurableObject.ts` and show the one-DO-per-session line.
