# Agent Notes (sreetamdas.com)

This repo is a personal website built with React + TanStack Start and deployed to Cloudflare Workers.
This file documents project conventions for humans and coding agents.

## Agent Preferences

- Prefer file header comments over inline comments: if documentation is needed, add a short multi-line comment at the start of the file explaining intent/constraints/flow. Use inline comments only when they are clearly the best fit for a very local, non-obvious detail.
- When committing, prefer Conventional Commits and small granular commits. Stage/commit one logical unit at a time so changes are easy to review and revert; avoid bundling setup, source, tests, docs, and generated updates into one large commit unless the diff is truly trivial. If the split is unclear, ask before committing.
- Bugs: add a regression test when it fits (especially for non-trivial or previously broken behavior).
- Don't run typecheck/build/other scripts until told so.
- **Avoid type assertions** (`as`, `as unknown`, `as any`) as a default rule. Prefer narrowing, better function signatures (for example `Pick<T, "field">` at boundaries), proper typing, or runtime validation. Treat `as unknown as` as disallowed unless there is no alternative. If any cast is truly unavoidable, keep it local and add a short comment explaining why.

## Quick Commands

- Install: `pnpm install`
- Dev: `pnpm dev` (runs Vite dev server with Content Collections plugin)
- Typecheck: `pnpm typecheck`
- Build: `pnpm build` (includes content build via `prebuild`)
- Lint/format check: `pnpm lint` (oxfmt check + oxlint)
- Auto-fix (when safe): `pnpm lint:fix`
- Deploy (production): `pnpm deploy` or `pnpm deploy:production`
- Deploy (staging): `pnpm deploy:staging`

## Staging Verification Loop

- When the goal is to prove a pushed change reached Cloudflare staging, prefer adding or updating a tiny staging-only smoke/debug signal (for example a no-store test route or harmless cosmetic marker) before pushing.
- Push the relevant commit(s) to `dev`, wait for the Cloudflare build to publish, then verify `https://staging.sreetamdas.com` directly. Staging usually updates quickly; start checking immediately and keep polling for up to about five minutes before reporting a deploy blocker.
- Confirm both the smoke signal and at least one relevant user-facing page or route before saying the staging build is good. Include the checked URL/path, status, and marker/result in the handoff.

## Tooling + Style

- Package manager: `pnpm`.
- Node: see `.nvmrc` (currently `24`).
- Formatting: `oxfmt`.
  - Default indentation uses tabs; print width 100.
  - `src/**/routeTree.gen.ts` is excluded from formatting.
- Linting: `oxlint`.
  - `no-console` is an error.
  - `@typescript-eslint/no-explicit-any` is an error (prefer `unknown` + narrowing).
  - Unused vars are allowed only if prefixed with `_`.
- Type checking: `tsgo` (`@typescript/native-preview`) — the native Go port of `tsc`.

## Architecture Conventions

- Routes live under `src/routes/` (TanStack Start).
- Content is MDX processed through Content Collections (see `./content-collections.ts`).
- Cloudflare Workers entry is `src/worker.ts` (wrapper around `@tanstack/react-start/server-entry`) (see `wrangler.jsonc`).

## Environment + Secrets

- Do not commit secrets.
- `.env` is for local overrides; use `.env.example` as a reference.
- Cloudflare bindings:
  - D1 is bound as `D1`.
  - KV is bound as `KV`.

## Repo Hygiene

- Avoid committing build outputs (`dist/`) unless a workflow explicitly requires it.
- Local Wrangler state (`.wrangler/`) should remain ignored.
- Keep plans/notes under `.agents/` when drafting work that will be resumed later.

## PR Expectations

- Prefer small, focused commits with clear intent.
- CI runs `pnpm typecheck` and `pnpm build` on PRs and on pushes to `main`/`dev`.
- Verify at least `pnpm typecheck` and `pnpm build` before opening a PR.
