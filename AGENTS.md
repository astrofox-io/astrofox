# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + React app rooted at `src/view` with shared engine code under `src/`.

- `src/view/`: UI layer (components, actions, hooks, styles, API adapters, app entry).
- `src/core/`: engine primitives (`Stage`, `Scene`, `Display`, `Renderer`, etc.).
- `src/displays/`, `src/effects/`, `src/canvas/`, `src/graphics/`, `src/shaders/`: rendering pipeline and visual modules.
- `src/audio/`, `src/utils/`, `src/config/`: audio processing, utilities, and JSON config.
- `src/view/assets/`: icons, images, and fonts/assets used by the view.
- `dist/`: production build output.

## Build, Test, and Development Commands
Use `pnpm` in this repository.

- `pnpm dev`: run local dev server (Vite).
- `pnpm build`: create production build in `dist/`.
- `pnpm preview`: serve the production build locally.
- `pnpm lint`: run Biome checks.
- `pnpm lint-fix`: apply Biome auto-fixes.

## Coding Style & Naming Conventions
- Formatting/linting: **Biome** (`biome.json`).
- Indentation: tabs in most existing source files; follow surrounding style.
- React components: `PascalCase` filenames and exports (e.g., `LayersPanel.jsx`).
- Utilities/config: `camelCase` or descriptive lowercase names (`utils/file.js`, `config/menu.json`).
- Keep imports path-aliased where configured (`actions/...`, `components/...`, `view/...`).

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
- Environment values are defined in `src/view/env.js` and injected via Vite config.
- Keep secrets out of repo files; use local environment/config mechanisms instead.
