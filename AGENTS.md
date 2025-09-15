# Repository Guidelines

## Experimentation First
This game is under rapid prototyping—opt for solutions that keep the simulation and client playable. Document TODOs inline when you knowingly take shortcuts, and flag brittle spots in PRs so the team can stabilize them later.

## Project Structure & Module Organization
The workspace is pnpm-managed. Runtime apps live in `apps/`: `apps/server` runs the Hono API plus game loop, and `apps/www` serves the Vite-powered React + PIXI client. Shared gameplay logic resides in `packages/game`, while request/response contracts are exported from `packages/api`. Generated output stays in each package’s `dist/`; source code belongs under `src/`, and client assets go in `apps/www/public/`.

## Build, Test, and Development Commands
- `pnpm install` – install all workspace dependencies.
- `pnpm --filter server dev` – boot the API server with `tsx` watch mode.
- `pnpm --filter www dev` – launch the browser client with Vite HMR.
- `pnpm dev:packages` – run every package’s `dev` script in parallel for full-stack playtesting.
- `pnpm --filter server build` / `pnpm --filter www build` – emit production bundles when you need reproducible demo builds.

## Coding Style & Naming Conventions
Favor clarity over polish. Keep TypeScript modules using two-space indentation and modern ES imports. Components and classes stay PascalCase; utilities use camelCase; constants in shared game logic prefer UPPER_SNAKE_CASE. ESLint currently exists only in `apps/www`; run `pnpm --filter www lint` before large UI merges, but don’t let lint errors block early experiments.

## Testing Guidelines
No automated harness is wired yet. Smoke-test changes manually: run both dev servers, confirm `/healthz` responds, and exercise any gameplay paths you touched. When adding tests, colocate `*.test.ts` files with their subjects and note the command needed to execute them in the affected package’s README.

## Commit & Pull Request Guidelines
Short, descriptive commit subjects (`Rough orbit decay prototype`) help future cleanup passes. WIP commits are acceptable, but summarize the end-to-end impact in the PR description, call out known gaps, and list manual checks performed. Attach screenshots or request logs if gameplay or API responses changed meaningfully.
