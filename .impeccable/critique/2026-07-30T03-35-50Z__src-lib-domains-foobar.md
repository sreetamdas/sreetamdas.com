---
target: src/lib/domains/foobar
total_score: 25
p0_count: 0
p1_count: 3
timestamp: 2026-07-30T03-35-50Z
slug: src-lib-domains-foobar
---
# Foobar Dashboard Design Critique

Method: dual-agent (A: /root/foobar_design_review · B: /root/foobar_detector)

## Design Health Score

| Heuristic | Score |
| --- | ---: |
| Visibility of system status | 3/4 |
| Match between system and real world | 3/4 |
| User control and freedom | 2/4 |
| Consistency and standards | 3/4 |
| Error prevention | 3/4 |
| Recognition rather than recall | 3/4 |
| Flexibility and efficiency | 1/4 |
| Aesthetic and minimalist design | 2/4 |
| Error recovery | 3/4 |
| Help and documentation | 2/4 |
| **Total** | **25/40** |

The interaction model is understandable and persistence is thoughtful, but the dashboard is not shaped around how a returning hunter scans, chooses, solves, and resumes.

## Anti-Patterns Verdict

- Assessment A found authored voice and mechanics, but roughly two dozen cards repeat the same icon-title-status-hint composition. The risk is structural sameness, not generic copy.
- Assessment B's source detector returned zero findings. Most runtime overlay warnings belonged to TanStack Devtools or the shared footer. The credible Foobar-owned issue was the cramped reset control.
- Verdict: not an AI-slop problem in voice or color; a density, hierarchy, and repetition problem.

## Overall Impression

Foobar has a delightful premise trapped inside a conventional card farm. The current page says “achievement checklist” more strongly than “secret hunt.” It inherits the 650px article width on desktop and becomes a roughly 6,000–6,600px procession on mobile.

The best direction is a wider hunter's field guide: one clear next action, compact challenge rows, progressive hint disclosure, a contextual Field Notes/basecamp sidebar, and completed achievements that feel collected rather than merely recolored.

## What's Working

- The secret-hunter premise, names, clues, and completion copy feel authored.
- Tier grouping provides a useful mental model.
- Completion notes and visual reveals add payoff.
- Semantic regions, labels, status text, dialogs, and persistence flows are generally solid.
- There is no horizontal mobile overflow.
- The purple/off-white identity is recognizable and worth preserving; it does not need a generic parchment makeover.

## Priority Issues

### P1 — No orientation or decisive next action

There is no page-level h1, compact progress summary, current milestone, or recommended continuation. Axe confirmed the missing h1. Add a proper game header with progress, current tier, one “Continue hunting” action, and compact tier navigation. Suggested command: `$impeccable layout`.

### P1 — Repetition turns curiosity into backlog anxiety

Completed and unresolved challenges occupy nearly the same volume and expose similar controls. Expanding one grid card also stretches its neighbor. Use progressive disclosure: compact unresolved field-guide entries, expand only the selected entry, and summarize completed work as collectible stamps or quiet rows. Suggested command: `$impeccable distill`.

### P1 — Article layout constrains the game

At 1440px the dashboard remains around 650px wide, wasting most of the viewport. Give only Foobar a 960–1050px shell with a 620–700px hunt column and a 260–320px sticky Field Notes/basecamp sidebar. Make notes navigate back to their challenge. Suggested command: `$impeccable layout`.

### P2 — Earned and locked states lack collectible contrast

Completion is mostly a purple icon and “Complete” label. Use a deliberate stamp, medallion, or compact earned tile; express tiers through rails, markers, and restrained accents rather than identical tinted cards. Suggested command: `$impeccable delight`.

### P2 — Feedback is spatially disconnected

Hint progress is recorded in Field Notes thousands of pixels away. Show inline “recorded in Field Notes” feedback and make notes link back to and open the challenge.

### P2 — Utility panels weaken the ending

Campfire, registry, cloud progress, stats, and reset make the ending administrative. Consolidate them into a secondary Basecamp; place reset under Manage progress; end the primary experience on the next hunt or milestone.

### P2 — Controls are undersized

Measured controls include 34px hint/sign-in buttons, a 32px reset button, and 24px header icon controls. Increase interactive hit areas to at least 44px. Suggested command: `$impeccable audit`.

## Persona Red Flags

- Alex: no filtering, collapse controls, compact mode, shortcuts, or deterministic next action.
- Sam: missing h1, undersized targets, and possible muted-text contrast concerns; status is not color-only, which is good.
- Casey: the long page and identical actions make resuming mentally expensive, even though persistence is strong.

## Minor Observations

- The local DEV dump dominates the development viewport.
- “Clear everything and Restart” has inconsistent capitalization.
- “3 hunters…” with “this fire needs company” is contradictory.
- The toast's wide shadow and tiny uppercase kicker feel generic; use a compact medallion, title first, note second.
- React Icons have inconsistent visual weights.
- Tier difficulty/count metadata is too small and detached.
- The reset dialog itself is clear and cautious.
