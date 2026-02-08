# React Three Fiber Migration PR Breakdown

## Scope
This plan migrates the current imperative Three.js pipeline to `@react-three/fiber` with incremental, shippable PRs and rollback safety.

## Non-Negotiable Contracts
- Keep `.afx` project schema stable during migration.
- Preserve scene/layer order semantics.
- Preserve blend mode and opacity behavior.
- Preserve reactor-driven animation behavior.
- Keep `save image` output dimensions and format behavior unchanged.

## PR 1: Render Backend Contract + Legacy Adapter
Summary:
- Introduce a backend abstraction so the app loop no longer talks to `Stage` directly.

Files:
- `src/core/render/RenderBackend.js` (interface contract)
- `src/core/render/LegacyBackend.js` (adapter for existing `Stage`)
- `src/core/render/index.js`

Implementation notes:
- No behavior change.
- Add `renderExportFrame` contract for deterministic export parity.

Exit criteria:
- App behavior unchanged.
- `pnpm lint` and `pnpm build` pass.

## PR 2: Wire Renderer to Backend
Summary:
- Replace direct `stage.render/getPixels/getImage` calls in renderer/action paths with backend calls.

Files:
- `src/core/Renderer.js`
- `src/view/actions/app.jsx`
- `src/view/global.jsx`

Implementation notes:
- Instantiate `new LegacyBackend(stage)` in global setup.
- Keep existing analyzer/reactor flow untouched.

Exit criteria:
- Playback and visual output unchanged.
- Save image still works.

## PR 3: Stage View Mount Boundary Cleanup
Summary:
- Move canvas ownership and backend initialization behind a single mount boundary.

Files:
- `src/view/components/stage/Stage.jsx`
- `src/view/actions/stage.jsx`

Implementation notes:
- Keep zoom UI logic intact.
- Ensure backend receives width/height/background updates through one path.

Exit criteria:
- Resize, zoom, and background color updates still match current behavior.

## PR 4: Feature Flag + Backend Selector
Summary:
- Add backend selection to support `legacy` and `r3f` runtime toggling.

Files:
- `src/view/env.js`
- `src/view/global.jsx`
- `src/core/render/createBackend.js` (new)

Implementation notes:
- Default to `legacy`.
- Ensure fast rollback by config only.

Exit criteria:
- Legacy path remains default and stable.
- Backend can be selected without code changes.

## PR 5: R3F Backend Shell
Summary:
- Add `R3FBackend` with lifecycle, sizing, and clear color wiring; no display/effect migration yet.

Files:
- `src/core/render/R3FBackend.jsx` (or `.js` + companion React mount module)
- `src/view/components/stage/Stage.jsx`
- `src/view/global.jsx`

Implementation notes:
- `@react-three/fiber` controls renderer lifecycle.
- Keep empty scene renderable at correct resolution.

Exit criteria:
- App boots and renders with `RENDER_BACKEND=r3f`.
- No regressions in layout or stage dimensions.

## PR 6: Domain Scene Model Normalization
Summary:
- Stop mutating live engine instances from stores; use normalized serializable scene state as source of truth.

Files:
- `src/view/actions/scenes.jsx`
- `src/view/actions/project.jsx`
- `src/view/stores.jsx` (if needed)
- `src/core` modules only where compatibility glue is required

Implementation notes:
- Define selectors that map state -> render model.
- Preserve current project serialization output.

Exit criteria:
- Loading/saving projects still round-trips.
- Layer edits and property edits remain stable.

## PR 7: Migrate Image Display
Summary:
- Port `ImageDisplay` to R3F node component first.

Files:
- `src/displays/ImageDisplay.js` (legacy kept)
- `src/view/r3f/displays/ImageDisplayNode.jsx` (new)
- `src/view/r3f/SceneGraph.jsx` (new)

Implementation notes:
- Preserve width/height lock, zoom, opacity, and rotation behavior.
- Validate asset loading and blank image behavior.

Exit criteria:
- Image display parity on fixture projects.

## PR 8: Migrate Geometry Display
Summary:
- Port `GeometryDisplay` to R3F with matching material/shape/light controls.

Files:
- `src/displays/GeometryDisplay.js` (legacy kept)
- `src/view/r3f/displays/GeometryDisplayNode.jsx` (new)
- shared geometry/material helpers under `src/view/r3f/`

Implementation notes:
- Preserve FFT-driven rotation behavior.
- Validate lights and camera zoom parity.

Exit criteria:
- Geometry display parity on fixture projects.

## PR 9: Migrate Remaining Displays
Summary:
- Port remaining display types in small slices.

Files:
- `src/view/r3f/displays/*`
- targeted files in `src/displays/*` only for compatibility stubs

Implementation notes:
- Migrate one display per PR if possible to isolate regressions.

Exit criteria:
- All displays render from R3F path with parity checks.

## PR 10: Effects/Postprocessing Migration
Summary:
- Rebuild effect stack in R3F-compatible pipeline while preserving blend behavior.

Files:
- `src/view/r3f/effects/*` (new)
- `src/effects/*` and `src/graphics/*` (legacy retained temporarily)

Implementation notes:
- Preserve effect ordering, pass sizing, uniforms, and blending semantics.

Exit criteria:
- Effects parity matrix signed off against fixtures.

## PR 11: Export Pipeline Parity
Summary:
- Implement `getPixels` and `getImage` parity for R3F backend and deterministic frame export.

Files:
- `src/core/render/R3FBackend.*`
- `src/view/actions/app.jsx`
- `src/core/Renderer.js`

Implementation notes:
- Ensure identical output size and expected color output.

Exit criteria:
- Save image works for both `legacy` and `r3f`.
- Deterministic frame rendering path validated.

## PR 12: Cutover + Legacy Removal
Summary:
- Make R3F default, remove legacy engine paths after parity signoff.

Files:
- Remove unused modules in `src/core`, `src/graphics`, `src/displays`, `src/effects` as appropriate.
- Update `README.md` and contributor docs.

Implementation notes:
- Remove feature flag only after validation window.

Exit criteria:
- `legacy` code fully removed or quarantined behind archival path.
- Build/lint/manual validation complete.

## Validation Checklist (Run On Every PR)
- `pnpm lint`
- `pnpm build`
- Load fixture `.afx` projects and check:
  - layer ordering
  - blend and opacity
  - reactor animation
  - canvas size and zoom
  - save image output dimensions
