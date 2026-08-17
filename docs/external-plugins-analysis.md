# External Plugins: Analysis & Spec Proposal

This document analyzes how Astrofox can support **external plugins** — third-party
displays and effects that a user adds by entering a URL, which the app then fetches
and runs — and proposes a plugin spec covering audio data, parameters, rendering,
and lifecycle.

- [1. What exists today](#1-what-exists-today)
- [2. Why the legacy path is not enough](#2-why-the-legacy-path-is-not-enough)
- [3. Security analysis](#3-security-analysis)
- [4. Execution models considered](#4-execution-models-considered)
- [5. Proposed architecture](#5-proposed-architecture)
- [6. Plugin spec (draft v1)](#6-plugin-spec-draft-v1)
- [7. Host integration work](#7-host-integration-work)
- [8. Phased roadmap](#8-phased-roadmap)
- [9. Open questions](#9-open-questions)

---

## 1. What exists today

### 1.1 A dormant plugin loader

The v1-era plugin mechanism survives in the codebase and is *almost* wired up:

- `loadPlugins()` (`src/app/actions/app.ts:888`) iterates descriptors from
  `api.getPlugins()`, dynamic-imports each `plugin.src` with
  `/* webpackIgnore: true */` — i.e. a true runtime `import()` of an arbitrary
  URL — and passes `plugin.default` to `Plugin.create()`.
- `Plugin.create()` (`src/lib/core/Plugin.ts`) subclasses `Display` or `Effect`
  based on `config.type`, copies the plugin's own properties onto the class
  (hoisting `config` as the static the rest of the app reads) and the plugin's
  `prototype` methods onto the subclass prototype.
- `loadLibrary()` (`src/app/actions/app.ts:914`) merges the result into the
  `library` map alongside the core displays/effects, keyed by descriptor key.

The chain is inert because `api.getPlugins()` returns `{}` unconditionally
(`src/app/api-client/index.ts:359`) and nothing in `electron/` implements it.
The `.gitignore` entry for `/plugins/` shows the original intent was a local
plugins directory on desktop.

### 1.2 The rendering architecture the loader predates

Rendering no longer goes through `Display.render()` — that is a no-op stub
(`src/lib/core/Display.ts:113`). The current pipeline is:

1. `Renderer.render()` (`src/lib/core/Renderer.ts:167`) runs on demand via rAF,
   pulls analyzer data, and builds a single mutable `RenderFrameData` object
   (`src/lib/types.ts:5`): `{ id, delta, fft, td, gain, audioPlaying, hasUpdate,
   reactors, ... }`. `fft` is the analyzer's live `Uint8Array(512)` (0–255),
   `td` its `Float32Array(1024)` (±1). Reactor outputs are a `Record<string,
   number>` of 0..1 scalars.
2. `CompositorBackend.render()` (`src/lib/core/render/CompositorBackend.ts:339`)
   first walks the class instances imperatively — `updateReactors()` on scenes,
   displays and effects, and `effect.render(scene, frameData)` (effects only) —
   then snapshots the stage and re-renders a `@react-three/fiber` root
   (`frameloop: 'demand'`, orthographic camera).
3. `StageRoot.tsx` dispatches each display to a React layer component via a
   **hardcoded `switch (display.name)`** over the 13 built-in names
   (`src/lib/core/render/StageRoot.tsx:101-274`). Unknown names silently render
   nothing.
4. "2D" displays draw into an offscreen canvas via the `CanvasTextureLayer` /
   `drawFrame({ canvas, properties, frameData })` pattern; the canvas becomes a
   `CanvasTexture` on a plane positioned by the standard
   `x/y/rotation/zoom/opacity` properties (`TexturePlane.tsx`). Audio parsing is
   per-display: each layer owns an `FFTParser`/`WaveParser` that windows,
   normalizes (0..1) and smooths the shared analyzer arrays.
5. Effects become composer passes through two more hardcoded factories keyed on
   `effect.name`: `createScenePass.ts` and `createRawEffect.ts`, both built on
   `ShaderPass` with the `inputTexture` / `resolution` uniform convention.
6. Export rendering is deterministic: `renderExportFrame`
   (`CompositorBackend.ts:365`) feeds the analyzer an `AudioBuffer` slice per
   frame (JS FFT path in `SpectrumAnalyzer`), forces `hasUpdate`, and fixes
   `delta = 1000 / fps`.

### 1.3 Parameters and reactors are already declarative

Control panels are generated entirely from `static config.controls` — a
declarative schema resolved by `Control.tsx`/`Option.tsx` against a fixed input
registry (`inputComponents.ts`). Reactors bind by property name
(`display.setReactor(prop, { id, min, max })`) and the host writes
`(max - min) * output + min` into `properties` each frame before rendering
(`Display.ts:75-97`). **This is the single best piece of existing leverage:
external plugins can reuse the whole controls + reactors system without any new
UI code**, with one caveat — schema values may currently be *functions*
(`property()`, `stageWidth()`), which don't survive serialization or a sandbox
boundary (see §6.4).

### 1.4 Serialization

Projects store elements as `{ id, name, type, enabled, displayName, properties,
reactors }` and reload by looking up `name` in the library
(`src/app/actions/project.ts:711-765`). Unknown names are warn-and-drop. There
is already a media relink flow (`RelinkMediaDialog`) that is a good template for
"plugin missing — refetch from URL?".

---

## 2. Why the legacy path is not enough

Even with `getPlugins()` implemented, a plugin loaded via `Plugin.create` today
would be a ghost: constructible, with working controls and reactors, but

- **invisible in the Add menus** — `SectionAddMenu.tsx` matches hardcoded label
  lists per category and silently drops everything else;
- **renders no pixels** — it falls through `StageRoot.tsx`'s `default: break`;
  only `Effect.render(scene, frameData)` is ever invoked imperatively, and core
  effects don't draw there either (passes do);
- **has no transform overlay** — `displayTransform.ts` special-cases known names.

In total there are ~14 hardcoded tables keyed on `display.name`,
`effect.name`, or `config.label` that a plugin would need to enter (add-menu
categories, layer dispatch, pass factories, live-updatable effect list, 3D
grouping, transform overlay, i18n label whitelist, blend-mode map, input-type
registry...). The first prerequisite for external plugins is therefore an
**internal registry refactor** (§7.1) so that "being in the library" is
sufficient for a display/effect to be addable, renderable, and transformable.

---

## 3. Security analysis

This is the part that rules out the obvious design. "Fetch a URL and `import()`
it" is exactly what `loadPlugins()` does — and on desktop it is remote code
execution with local-system reach.

### 3.1 Threat model

Running third-party JS in the main renderer realm gives it:

- **The desktop bridge.** `window.__ASTROFOX__` is exposed to the whole main
  world via `contextBridge` (`electron/preload.mjs`). It includes:
  - `ffmpeg:run` with a **fully renderer-supplied argv** array
    (`electron/ffmpeg-ipc.mjs:49`) — arbitrary file read/write via ffmpeg's
    `-i` / output paths and protocol handlers;
  - `desktop:read-file` with **no path restriction** (`ffmpeg-ipc.mjs:208`);
  - `shell.openPath` / `showItemInFolder` on arbitrary strings.
- **A permissive window.** `sandbox: false`, no CSP anywhere, no
  `will-navigate` guard, no `setWindowOpenHandler`, no permission-request
  handler (`electron/main.mjs:185-193`). A malicious plugin can navigate the
  window, open windows, use mic/screen capture, and exfiltrate anything it can
  read.
- **The app itself**: project data, the zustand stores, the audio graph, other
  plugins' code, and (in dev) `window._astrofox` globals.
- On the **web build** the blast radius is smaller (no bridge, browser sandbox)
  but still includes the user's project, clipboard-adjacent APIs, and network
  exfiltration.

Also note: plugins are *persistent* (stored in projects and auto-loaded), so a
compromised plugin URL is a supply-chain attack on every project that uses it.
The URL's content can change after the user vetted it.

### 3.2 Consequences for the design

1. **Untrusted code must not run in the main realm.** Isolation (worker and/or
   sandboxed iframe) is a requirement, not an option, at least on desktop.
2. **Prefer data over code where possible.** A shader + declarative uniform
   schema is not a program with ambient authority; it's the safest plugin tier
   and covers most *effects*.
3. **Pin content.** Record a subresource-integrity hash at install time and
   verify on every subsequent load, so a vetted URL can't silently change.
   Updates become an explicit user action.
4. **Independent hardening (worth doing regardless of this feature):** add a
   CSP; set `sandbox: true` where feasible; validate/whitelist `ffmpeg:run`
   argv shapes in the main process; restrict `desktop:read-file` to expected
   roots; add `will-navigate` and window-open guards. Keep
   `nodeIntegrationInSubFrames` at its default (false) so preload never runs in
   iframes — this is what makes the iframe sandbox meaningful on desktop.

### 3.3 Residual risks to accept explicitly

- A worker/iframe can still spin CPU (denial of service on the render loop) —
  mitigated by per-frame timeouts and a "plugin unresponsive → disable" policy.
- Network exfiltration from inside a sandbox is hard to fully prevent on the
  web build (no CSP control over a data-URL worker's `fetch` beyond the page's
  own CSP). On desktop, the Electron session can block requests whose initiator
  is the sandbox origin. A per-plugin "network" permission prompt is the honest
  UX. Audio data itself is low-sensitivity, but project contents are passed to
  plugins via properties — keep the plugin input surface minimal.

---

## 4. Execution models considered

| Model | Isolation | Perf | Capability | Notes |
|---|---|---|---|---|
| **A. Main-realm `import()`** (status quo path) | none | best | full three.js/DOM | Unacceptable for untrusted URLs on desktop (§3). Fine as an explicit **dev mode** for plugin authors. |
| **B. Declarative shader plugins** (no JS at all) | total | native | fragment-shader effects, shader displays | GLSL + uniform schema compiled by the host into the existing `ShaderPass` chain. Covers most effect ideas; can't do layout/text/complex geometry. |
| **C. Web Worker + OffscreenCanvas** | strong (no DOM, no bridge) | good | canvas-2d and WebGL drawing, arbitrary JS logic | Plugin draws into an `OffscreenCanvas` in the worker; host receives an `ImageBitmap` (zero-copy transfer) and uploads it as a texture — exactly the shape of the existing `CanvasTextureLayer` pattern. Async by nature: one frame of latency, or await in export. |
| **D. Sandboxed iframe (`sandbox` attr, opaque origin) hosting the worker** | strongest, adds origin isolation + CSP leverage | good | same as C | The iframe is a container for CSP/permission control; actual work still in a worker. More moving parts; postMessage double-hop. |
| **E. In-realm interpreter (SES/ShadowRealm/QuickJS-wasm)** | strong | poor–medium | JS logic only, no direct canvas | Heavyweight dependency; ShadowRealm still not shipped everywhere; wasm interpreter for per-frame drawing is slow. Not recommended for v1. |

**Recommendation:** a **tiered system**:

- **Tier 1 — shader plugins (data, not code).** Ship first. An external effect
  is a manifest + fragment shader; the host owns compilation, the pass chain,
  uniforms, controls, reactors. Zero sandboxing needed beyond shader compile
  guards (already have try/catch around pass construction, plus size/complexity
  limits).
- **Tier 2 — worker plugins (code in a sandbox).** Canvas-2d (and later WebGL)
  displays as JS plugins running in a dedicated `Worker` created from the
  *cached, integrity-checked* source via a blob URL. Communication via
  postMessage + transferables. On desktop, additionally block network for the
  worker at the session level unless the plugin holds the `network` permission.
- **Dev mode — main-realm import behind an explicit toggle** ("Load unpacked
  plugin", desktop only, scary consent dialog), reusing `Plugin.create`. This
  is how authors iterate before packaging; it is never triggered by a URL from
  a project file.

Tier boundaries are expressed in the manifest (`runtime: "shader" | "worker"`)
so the permission UI can be honest about what a plugin can do.

---

## 5. Proposed architecture

```
                        ┌────────────────────────────────────────────┐
  user enters URL ──►   │ PluginInstaller                            │
                        │  fetch manifest → fetch entry/shader       │
                        │  → hash (SRI) → permission dialog          │
                        │  → persist to plugin store (cache + meta)  │
                        └───────────────┬────────────────────────────┘
                                        │ register
                                        ▼
                        ┌────────────────────────────────────────────┐
                        │ library ('displays' / 'effects')           │
                        │  core classes + ExternalDisplay/Effect     │
                        │  subclasses built from manifest            │
                        └───────────────┬────────────────────────────┘
                            add menu / project load (by config.name)
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │ per-frame host loop (unchanged)                              │
        │  Renderer → updateReactors (host-side, writes properties)    │
        │           → CompositorBackend → StageRoot                    │
        │                                   │                          │
        │             registry lookup (replaces switch):               │
        │               core name → built-in layer                     │
        │               external display → ExternalDisplayLayer ───────┼──► PluginWorker
        │               external effect (shader) → ShaderPass from     │    (postMessage:
        │                 manifest, in existing PassChain              │     init/update/
        └──────────────────────────────────────────────────────────────┘     frame/dispose;
                                                                             ImageBitmap back)
```

Key points:

- **Reactors, controls, serialization, and audio parsing stay host-side.** The
  worker only ever sees `properties` (already reactor-modulated by
  `updateReactors`) and a compact, pre-parsed audio frame. This keeps the
  plugin API small and keeps every existing UI feature working for free.
- **The host parses audio for the plugin** according to the manifest's `audio`
  block, using the existing `FFTParser`/`WaveParser` semantics (0..1, windowed,
  smoothed). Plugins never touch the raw analyzer. This also makes offline
  export identical to live rendering from the plugin's point of view.
- **External displays are one generic React layer.** `ExternalDisplayLayer`
  behaves like `CanvasTextureLayer`/`TexturePlane`: it owns a `CanvasTexture`,
  posts `{frame, properties, size}` to the plugin worker, receives an
  `ImageBitmap`, uploads it, and reuses the standard transform properties
  (`x/y/rotation/zoom/opacity` + scene blending). Because it takes the standard
  bounding box, the transform overlay works generically too.
- **External shader effects are compiled into the existing composer.** The
  manifest maps property names to uniforms; the host builds a `ShaderPass`
  (with `inputTexture`/`resolution` filled per convention) and an
  `__updateScenePass` updater that copies mapped properties + frame scalars
  (`time`, `delta`, a small set of audio scalars) into uniforms.

### Export / determinism

Video export must produce identical output for identical input. Rules:

- The host provides `frame.time` (frame / fps during export, playback time
  live) and `frame.delta` (fixed `1000/fps` during export). Plugins must derive
  all animation from these — the spec forbids `Date.now()`/`performance.now()`
  as animation clocks and requires seeded randomness (the host passes a
  per-instance `seed`).
- Export renders frame-by-frame and *awaits* the worker round-trip per frame
  (the export loop is already async per frame in `VideoExporter`); live
  rendering tolerates one frame of latency instead of blocking rAF.

---

## 6. Plugin spec (draft v1)

### 6.1 Distribution format

A plugin is a directory (or single URL) containing a **manifest** plus assets.
The user enters the manifest URL (`https://.../astrofox.plugin.json`); entering
a bare `.js`/`.frag` URL is allowed if the file self-describes (worker plugins
export `manifest`; not recommended for v1 docs).

```jsonc
// astrofox.plugin.json
{
  "api": 1,                          // spec version; host refuses unknown majors
  "name": "@mikecao/super-bars",     // globally-namespaced id; serialized into projects
  "version": "1.2.0",
  "label": "Super Bars",             // UI label (Add menu, layers panel)
  "description": "Bar spectrum with per-bar physics.",
  "author": "Mike Cao",
  "homepage": "https://github.com/...",
  "type": "display",                 // "display" | "effect"
  "runtime": "worker",               // "worker" | "shader"
  "entry": "./index.js",             // runtime=worker: ESM entry
  // "shader": "./effect.frag",      // runtime=shader: fragment shader
  "icon": "./icon.svg",              // rendered in Add menu / layers panel
  "permissions": [],                 // e.g. ["network"] — each is a user prompt
  "audio": {                         // what the host should hand the plugin
    "fft":  { "bins": 64, "minFrequency": 0, "maxFrequency": 6000,
              "smoothing": 0.5, "minDecibels": -100, "maxDecibels": -12 },
    "td":   { "samples": 256 }       // omit fft/td to not receive them
  },
  "defaultProperties": { /* §6.4 */ },
  "controls": { /* §6.4 */ }
}
```

Install pipeline: fetch manifest → validate with zod (already a dependency,
currently unused) → fetch entry/shader/icon → compute SHA-384 for each file →
show consent dialog (name, author, origin, type/runtime, permissions) → persist
`{manifest, files, hashes, installedAt, sourceUrl}` in the plugin store
(desktop: `userData/plugins/`; web: Cache API + IndexedDB) → register into
`library`. Subsequent app launches load from the store and re-verify hashes —
the network is only touched again for an explicit "check for updates".

### 6.2 Worker plugin runtime (`runtime: "worker"`, `type: "display"`)

The entry is an ES module executed inside a dedicated `Worker` (module type),
instantiated from the cached blob. It default-exports a factory:

```js
// index.js
export default function createPlugin({ properties, seed, size }) {
  // Private per-instance state lives in this closure.
  let canvas;   // OffscreenCanvas, provided in init
  let ctx;

  return {
    // Called once. The host transfers an OffscreenCanvas sized to the
    // plugin's content box (from properties/size).
    init({ canvas: c }) {
      canvas = c;
      ctx = canvas.getContext('2d');
    },

    // Properties changed (user edit or reactor). Cheap; called at most
    // once per frame before render.
    update(properties) { /* re-derive cached values */ },

    // Called every frame the stage renders. Draw into the canvas.
    // Return value optional: { width, height, originX, originY } to
    // request a resize / set the transform origin (CanvasTextureLayer
    // semantics). The host then snapshots the canvas into an ImageBitmap.
    render(frame) {
      const { fft, td, time, delta, playing, volume } = frame;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ... draw using fft (Float32Array, 0..1, bins per manifest) ...
    },

    // Stage or property-driven size change.
    resize({ width, height }) {},

    dispose() {},
  };
}
```

**The frame object** (structured-cloned each frame; arrays are transferred or
copied — small because bin counts come from the manifest):

```ts
interface PluginFrame {
  id: number;        // monotonically increasing; -1-style export id not exposed
  time: number;      // seconds; playback position live, frame/fps in export
  delta: number;     // ms since last frame; fixed 1000/fps in export
  playing: boolean;  // audio is playing (or live input active)
  exporting: boolean;
  volume: number;    // 0..1 overall level (host normalizes analyzer gain/255)
  fft?: Float32Array;// per manifest.audio.fft: 0..1, windowed + smoothed
  td?: Float32Array; // per manifest.audio.td: 0..1, silence at 0.5
  seed: number;      // stable per instance; use for deterministic randomness
}
```

Deliberately absent: raw analyzer arrays, reactor outputs (already folded into
`properties` by the host), input mode / source labels, and anything DOM-ish.
Additions later (e.g. beat events, BPM) are additive and gated by `api`.

**Host↔worker protocol** (one worker per plugin *definition*, one instance
record per stage element — a worker crash or per-frame deadline miss disables
the element with a badge in the layers panel, never the app):

```
host → worker: {op:'create', instanceId, properties, seed, size}
host → worker: {op:'init', instanceId, canvas (transfer)}
host → worker: {op:'update', instanceId, properties}
host → worker: {op:'frame', instanceId, frame (fft/td transferred)}
worker → host: {op:'frame-done', instanceId, bitmap (transfer), box?}
host → worker: {op:'resize'|'dispose', instanceId, ...}
```

### 6.3 Shader plugin runtime (`runtime: "shader"`, `type: "effect"`)

No JavaScript. The manifest names a GLSL fragment shader; the host wraps it in
the existing `ShaderPass` (`src/lib/core/render/composer/ShaderPass.ts`) and
inserts it into the scene's `PassChain` like any core effect.

Contract (matches the existing convention):

```glsl
// Provided by the host:
uniform sampler2D inputTexture;  // previous pass output
uniform vec2 resolution;         // pass size in px
uniform float time;              // seconds (deterministic in export)
uniform float delta;             // ms
uniform float volume;            // 0..1
// Plus one uniform per entry in manifest "uniforms":
uniform float amount;            // e.g. mapped from properties.amount
varying vec2 vUv;                // fullscreen quad UV
void main() { ... }
```

```jsonc
// manifest additions for shader effects
"shader": "./effect.frag",
"uniforms": {
  "amount":  { "type": "float", "from": "amount" },     // property → uniform
  "tint":    { "type": "vec3",  "from": "color" },      // '#rrggbb' → vec3
  "center":  { "type": "vec2",  "from": ["x", "y"] }
}
```

Because reactors modulate `properties` host-side, `withReactor` controls work
on shader uniforms with zero plugin effort. Shader compile failure at install
time rejects the plugin; at load time it disables the effect with an error
badge. Guardrails: source size limit, `#include` disallowed, loop bounds lint
(best-effort), and the existing per-pass try/catch in `PassChain.render`.

A later `type: "display"` + `runtime: "shader"` variant (Shadertoy-style
generative layers rendering to a texture with no `inputTexture`) falls out of
the same machinery cheaply and is worth planning for — it likely covers the
majority of community demand (audio-reactive fragment shaders).

### 6.4 Parameters / controls

Reuse the existing declarative schema (`config.controls` →
`Control.tsx`/`Option.tsx`) with one change: **all values must be serializable**.
Core controls may embed functions (`property('maxFrequency')`,
`stageWidth()`); external manifests instead use declarative refs the host
resolves with the same semantics:

```jsonc
"defaultProperties": {
  "barCount": 64, "gravity": 0.8, "color": "#ffffff",
  "x": 0, "y": 0, "rotation": 0, "opacity": 1.0   // standard transform props
},
"controls": {
  "barCount": { "type": "number", "label": "Bars", "min": 8, "max": 256,
                "step": 1, "withRange": true },
  "gravity":  { "type": "number", "min": 0, "max": 1, "step": 0.01,
                "withRange": true, "withReactor": true },
  "color":    { "type": "color" },
  "maxFrequency": { "type": "number", "min": { "$prop": "minFrequency" },
                    "max": 22000, "withRange": true },
  "width":    { "type": "number", "max": { "$stage": "width" },
                "withRange": true },
  "barWidth": { "type": "number", "hidden": { "$prop": "autoSize" } }
}
```

- `{"$prop": name}` → live value of another property (the `property()` helper).
- `{"$stage": "width"|"height"}` → `stageWidth()`/`stageHeight()`.
- Allowed `type` values are the existing registry: `text, number, toggle,
  checkbox, color, colorrange, range, select, image, video, time`. No custom
  input components in v1.
- `withReactor` works unchanged (host-side). i18n already falls back to the raw
  label for unknown strings, so nothing breaks there.

For `type: "display"` plugins the host injects the standard transform block
(`x, y, rotation, opacity` and optionally `zoom`) if absent, so every external
display is positionable, blendable, reactor-able, and gets the transform
overlay for free.

### 6.5 Serialization & project portability

External elements serialize like core ones plus provenance:

```jsonc
{
  "name": "@mikecao/super-bars",     // library key == manifest name
  "type": "display",
  "displayName": "Super Bars 1",
  "properties": { ... },
  "reactors": { ... },
  "plugin": {                        // NEW block, external elements only
    "url": "https://example.com/super-bars/astrofox.plugin.json",
    "version": "1.2.0",
    "integrity": "sha384-..."        // hash of the manifest (which pins files)
  }
}
```

On project load, `loadElement` (`project.ts:715`) resolves `name` in the
library; on miss with a `plugin` block present, the app offers a relink-style
dialog: "This project uses *Super Bars 1.2.0* from example.com — fetch and
install?" (with the same consent + integrity flow as manual install; an
integrity mismatch against the recorded hash is a hard warning). Declined →
element loads disabled as a placeholder rather than being dropped, so saving
doesn't destroy it.

---

## 7. Host integration work

### 7.1 Registry refactor (prerequisite, no behavior change)

> **Status: done.** Core effects register their pass factory + rebuild metadata
> from their own module (`src/lib/effects/*.ts` → `registerEffectPass`);
> `createScenePass`/`createRawEffect` and the `LIVE_UPDATABLE_EFFECTS` /
> `STRUCTURAL_EFFECT_PROPS` tables are gone. `displayLayerRegistry` is the only
> source of the per-display `camera` capability. Add menus are driven by `config.category` /
> `config.order`, generated-name labels come from the library, and the
> transform overlay reads a per-display `config.transform` block instead of
> testing names. Core entities carry `config.builtin = true`.

Replace the name-keyed hardcoded tables with data on the class/config so that
library membership is sufficient:

1. **Layer dispatch** — `StageRoot.tsx:101-274`: replace the `switch` with a
   `displayLayerRegistry: Record<name, LayerComponent>` populated by the core
   displays, plus a generic `ExternalDisplayLayer` fallback for library entries
   flagged external. (Done — the shared 3D render group has since been removed
   entirely; 3D displays are self-contained layers with a `camera` capability
   flag in the registry.)
2. **Effect pass factories** — `createScenePass.ts` / `createRawEffect.ts`:
   key on a `config.createPass(effect, w, h)` (or a registry map) instead of
   name switches; external shader effects register a manifest-driven factory.
   Same for the `LIVE_UPDATABLE_EFFECTS` / `STRUCTURAL_EFFECT_PROPS` sets in
   `SceneWithEffects.tsx` → `config.passRebuild` metadata.
3. **Add menus** — `SectionAddMenu.tsx` matches labels; add a `config.category`
   and an automatic **External** section listing installed plugins (with icon),
   so external plugins are reachable without touching the hardcoded category
   lists.
4. **Transform overlay** — `displayTransform.ts` name-switch → use the layer's
   reported box (external displays already return one) with a generic fallback.
5. Fix two small host bugs surfaced by this analysis while in there:
   `frameData.volume` is declared but never assigned (always 0), and
   `frameData.gain` is 0–255 — the plugin spec's `volume: 0..1` needs a real
   normalized level.

This refactor pays for itself even if external plugins never ship — it deletes
five parallel switch statements that must currently be updated in lockstep to
add a core display.

### 7.2 New components

- `src/lib/plugins/` — `PluginInstaller` (fetch/validate/hash/consent/store),
  `PluginStore` (desktop dir / web Cache API), `PluginHost` (worker lifecycle +
  protocol), `ExternalDisplay` / `ExternalEffect` (thin `Display`/`Effect`
  subclasses built from a manifest — the modern replacement for `Plugin.ts`),
  `shaderEffectFactory` (manifest → `ShaderPass`).
- `ExternalDisplayLayer.tsx` next to the existing layers.
- UI: "Add plugin from URL…" entry (Add menu footer or settings), consent
  dialog, plugin manager panel (list / update / remove / permissions), error
  badges on failed elements.
- Zod schemas for manifest + project `plugin` block (first real use of the
  existing zod dependency).
- Electron hardening from §3.2.4 as an accompanying PR.

### 7.3 What deliberately does not change

The render loop, reactor system, controls renderer, project format for core
elements, and the export path all stay as-is. The worker boundary is placed so
that everything stateful and UI-facing remains host-side.

---

## 8. Phased roadmap

| Phase | Scope | Outcome |
|---|---|---|
| **0** | Registry refactor (§7.1) + Electron hardening (§3.2.4) | Core pluggable internally; safer app regardless |
| **1** | Shader effect plugins: manifest, installer, store, consent UI, `shaderEffectFactory`, project `plugin` block + relink | Users load effects from URLs; zero arbitrary code execution |
| **2** | Worker display plugins: `PluginHost`, `ExternalDisplayLayer`, frame protocol, export integration, watchdog/disable policy | Full custom displays from URLs, sandboxed |
| **3** | Ecosystem: shader *displays* (Shadertoy-style), plugin manager panel, update checks, dev mode (local unpacked + hot reload), docs + template repo | Authoring story and community growth |

Phase 1 is intentionally first among the user-visible phases: it delivers the
"paste a URL, get a new effect" experience with the smallest security surface
and validates the manifest/store/consent machinery that Phase 2 reuses.

## 9. Open questions

1. **Web-build network policy** — is a `network` permission prompt acceptable,
   or should worker plugins be offline-only everywhere (desktop can enforce;
   web can't fully)?
2. **WebGL worker displays in v1 of Phase 2**, or canvas-2d only first?
   (OffscreenCanvas WebGL in workers is well-supported now; the protocol is
   identical, so it's mostly testing surface.)
3. **A curated index** (`plugins.astrofox.io`) vs. raw URLs only — a registry
   improves discovery and enables revocation lists, but raw URLs should keep
   working either way.
4. **Versioning policy for projects** — pin exact plugin versions in projects
   (deterministic re-renders) with explicit per-project upgrade, or follow
   installed versions? Proposed: pin + prompt.
5. **Should `Plugin.ts` / `loadPlugins()` be removed** once `ExternalDisplay`/
   `ExternalEffect` exist, or repurposed as the dev-mode loader? Proposed:
   repurpose for dev mode (desktop-only, consent-gated), since it's the only
   path that gives authors main-realm debugging.
