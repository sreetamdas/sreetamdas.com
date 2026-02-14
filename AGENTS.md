# Agent Notes (sreetamdas.com)

This repo is a personal website built with React + TanStack Start and deployed to Cloudflare Workers.
This file documents project conventions for humans and coding agents.

## Agent Preferences

- Prefer file header comments over inline comments: if documentation is needed, add a short multi-line comment at the start of the file explaining intent/constraints/flow. Use inline comments only when they are clearly the best fit for a very local, non-obvious detail.
- When committing, prefer Conventional Commits when possible, and stage/commit changes in logical units so they are easy to revert later (avoid bundling unrelated changes in a single commit).
- Bugs: add a regression test when it fits (especially for non-trivial or previously broken behavior).

## Quick Commands

- Install: `pnpm install`
- Dev: `pnpm dev` (runs Velite watch + Vite dev server)
- Typecheck: `pnpm typecheck`
- Build: `pnpm build` (includes content build via `prebuild`)
- Lint/format check: `pnpm lint` (oxfmt check + oxlint)
- Auto-fix (when safe): `pnpm lint:fix`
- Deploy (production): `pnpm deploy` or `pnpm deploy:production`
- Deploy (staging): `pnpm deploy:staging`

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
- Content is MDX processed through Velite (see `./.config/velite.config.ts`).
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
