# Repository Guidelines

## Project Structure & Module Organization
This project is a Next.js app using the App Router with source code grouped under `src/`.

- `src/app/`: Next.js routes, layouts, and API route handlers (`/api/auth`, `/api/projects`).
- `src/lib/`: client app and rendering engine code.
  - `src/lib/view/`: UI layer (components, actions, hooks, styles, API adapters, app entry).
  - `src/lib/core/`, `src/lib/displays/`, `src/lib/effects/`, `src/lib/canvas/`, `src/lib/graphics/`, `src/lib/shaders/`: rendering pipeline.
  - `src/lib/audio/`, `src/lib/utils/`, `src/lib/config/`: audio processing, utilities, and JSON config.
- `src/server/`: auth and database modules used by App Router APIs.
- `public/`: static assets served by Next.js.

## Build, Test, and Development Commands
Use `pnpm` in this repository.

- `pnpm dev`: run local Next.js dev server (Turbopack).
- `pnpm build`: create production build (`next build --turbo`).
- `pnpm start`: run production server (`next start`).
- `pnpm lint`: run Biome checks.
- `pnpm lint-fix`: apply Biome auto-fixes.
- `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`: Drizzle schema workflows.

## Coding Style & Naming Conventions
- Formatting/linting: **Biome** (`biome.json`).
- Indentation: tabs in most existing source files; follow surrounding style.
- React components: `PascalCase` filenames and exports (e.g., `LayersPanel.jsx`).
- Utilities/config: `camelCase` or descriptive lowercase names (`utils/file.js`, `config/menu.json`).
- Keep imports path-aliased where configured (`@/...`, `actions/...`, `components/...`, `view/...`).

## Testing Guidelines
There is currently no dedicated automated test suite configured in `package.json`.

When contributing:
- run `pnpm lint` and `pnpm build` before opening a PR;
- manually verify affected UI flows (especially rendering, audio, and controls).
- if you add tests, place them near the feature and document how to run them.

## Commit & Pull Request Guidelines
Follow the existing commit style: short, imperative, specific.

Examples:
- `Remove video export option, screens, and backend pipeline`
- `Fix image control updates not rendering on canvas`

PRs should include:
- clear summary of what changed and why;
- impacted paths/modules;
- screenshots or short clips for UI changes;
- verification steps (`pnpm lint`, `pnpm build`, manual checks).

## Configuration & Security Notes
- Client runtime values are defined in `src/lib/view/env.js`.
- Server auth/db values are loaded from environment variables in `src/server/*`.
- Drizzle schema and migrations live under `src/server/db/`.
- Keep secrets out of repo files; use local environment/config mechanisms instead.
