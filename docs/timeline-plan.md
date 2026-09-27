# Timeline — implementation plan

Goal: let a person or an agent (via MCP) decide *when* each element is active
and *how* its properties change over time, synced to audio, without an After
Effects-grade interface.

Design principles

- **One clock.** A project transport is the single source of time. Audio,
  rendering, scrubbing, preview and export all read from it. Time is always
  absolute seconds from project start; frames are `time * fps`.
- **Absent means "always".** An element with no clip is active for the whole
  project; a property with no keyframes is static. Existing projects load and
  behave identically with zero migration.
- **A bar is the whole mental model.** Each layer gets one bar: where it starts,
  where it ends, optional fade in/out. Keyframes are an *opt-in* second level
  shown only when they exist.
- **Agent-first API.** Tools take seconds, are idempotent setters, accept
  batches (the MCP dispatcher runs one command at a time, so round trips are
  expensive), and every write returns the resulting state. Audio analysis
  (beats, onsets, energy) is exposed so an agent can *compute* timings instead
  of guessing.
- **Deterministic time.** The same `time` must produce the same frame in the
  editor, in `get_preview({ time })` and in the export.

---

## Current state (what the plan builds on)

| Concern | Today | Consequence |
| --- | --- | --- |
| Clock | `Player`/`Audio` is the only clock. `RenderFrameData` has no absolute `time`; effects and plugins accumulate `frameData.delta`. | Nothing can be scheduled; no playback without audio; seeking is not deterministic for time-based effects. |
| Seeking | `Audio.updatePosition` does `~~(pos * duration)` — truncates to whole seconds. | Frame-accurate scrubbing is impossible until fixed. |
| Element gating | `enabled` boolean only. Gated in `StageRoot` (scene skip, `<group visible>`), `isEffectEnabled`, `updateNativeSceneState`. | Clip activity can reuse exactly these three gates. |
| Properties | Reactors write straight into `display.properties` every frame; `useEntity` copies back only the edited keys to keep runtime values out of undo. | No authored/runtime separation; keyframes and fades need one. |
| Undo | `history.ts` snapshots `sceneStore.scenes` (from `toJSON`) + reactors + stage, with pointer gestures. | Anything serialized by `toJSON` and restored by `Display.create` gets undo for free. |
| Project file | `snapshot = { version, stage, scenes, reactors }`; unknown entity keys are copied onto entities by `Entity.create`; `validateSnapshot` (MCP open) whitelists entity fields. | Additive fields are safe; the MCP whitelist must be extended. |
| Export | `renderExportFrame(frame, fps)` slices audio at `frame / fps`; requires loaded audio for duration; `frameData.delta = 1000/fps`. | Already deterministic per frame; needs `time` and a project duration independent of audio. |
| MCP | `playback` seeks by fraction 0–1; `get_preview` is a live capture, not a time render. | Needs seconds, and a deterministic "render at t". |
| Prototype | Untracked `src/lib/animation/*`, `src/app/actions/animation.ts`, `src/app/components/timeline/*`. Not imported; does not type-check. | Reuse `tracks.ts` (schema, binary-search evaluation, colour interpolation, easing). Discard the UI and the parallel undo stack. |

---

## Data model

```ts
// Stored on Scene, Display and Effect (all extend Display), alongside `reactors`.
interface Clip {
  start: number;        // seconds, >= 0
  end: number | null;   // seconds, > start; null = until project end
  fadeIn?: number;      // seconds, >= 0, applied to `opacity` if the element has one
  fadeOut?: number;
}

// Phase 2. Reuses the prototype's schema verbatim.
type Tracks = Record<string /* property */, {
  type: 'number' | 'color' | 'colors';
  keyframes: { id: string; time: number; value: number | string | string[]; easing: EasingName }[];
}>;

interface ReactorConfig {          // existing, plus:
  id: string; min: number; max: number;
  mode?: 'replace' | 'add' | 'multiply';   // default 'replace' (current behaviour)
}

// Project-level, saved in the .afx snapshot next to stage/scenes/reactors.
interface TimelineSettings {
  duration: number | null;   // null = follow audio (or 30 s without audio)
  fps: 30 | 60;              // default 30; keyframe times stay in seconds
  markers?: { id: string; time: number; label: string }[];   // Phase 3
}
```

Serialized entity (additive):

```json
{ "id": "…", "name": "TextDisplay", "properties": { "…": "authored values" },
  "reactors": { "opacity": { "id": "…", "min": 0, "max": 1, "mode": "multiply" } },
  "clip": { "start": 4, "end": 12.5, "fadeIn": 0.5 },
  "tracks": { "x": { "type": "number", "keyframes": [ … ] } } }
```

### Per-frame evaluation order

```
authored properties
  → keyframe tracks at t (Phase 2)
  → clip fade envelope × opacity (if element has `opacity`)
  → reactors (replace | add | multiply)
  = runtime properties (what layers/passes read)
```

Runtime values never round-trip into `toJSON`, the scene store, or undo.

---

## Phase 1 — Transport, clips, foundation (the "when" of the feature)

Deliverable: play/scrub a project clock with or without audio; every layer has
a bar on a timeline; save/load/undo; MCP can set clips, seek in seconds and
render a deterministic preview at any time.

### 1.1 Transport (`src/lib/timeline/transport.ts`)

Zustand store `{ time, duration, explicitDuration, fps, playing, loop }` +
imperative API: `seek(t)`, `play()`, `pause()`, `stop()`, `tick()`,
`setDuration()`, `setFps()`, `reset(settings)`. Bind to `player`:

- While audio is playing, `tick()` takes `player.getCurrentTime()` as
  authoritative (no drift). Past the audio end or without audio, advance on
  `performance.now()` until `duration`, then stop or loop.
- `seek(t)` → `player.seek(t / audioDuration)` when `t` is inside the audio,
  otherwise pause audio; audio resumes when the playhead re-enters it.
- Listen to `player` `play|pause|stop|seek` so the existing waveform click and
  Play buttons keep working; guard against re-entrancy.
- Live inputs (mic/desktop/MIDI) keep feeding reactors; the transport runs on
  its own clock.

Fix `Audio.updatePosition` to keep fractional seconds (`pos * duration`, no
`~~`). Add `Player.seekTime(seconds)`.

### 1.2 Renderer plumbing

- `RenderFrameData` gains `time: number` and `fps: number`.
- `Renderer.render()`: `frameData.time = transport.tick()`;
  `hasUpdate = player.isPlaying() || transport.playing || export`;
  `shouldKeepRendering()` also true while `transport.playing`.
- `CompositorBackend.renderExportFrame`: `frameData.time = frame / fps`.
- `Renderer.getAudioSample(time)`: return silence when `time` is outside the
  buffer so analysis/reactors work in silent intros/outros.
- `PluginFrame.time` (worker plugins), `ShaderDisplayLayer`/`shaderEffectFactory`
  `time` uniform: derive from `frameData.time` instead of accumulating delta
  (docs already promise "deterministic during export"; this makes it true when
  seeking too). Core effects that accumulate (`Distortion`, `FilmGrain`,
  `Shockwave`, `VHS`) can stay delta-based in Phase 1 — noted as a Phase 4 item.

### 1.3 Authored vs runtime properties (`Display.ts`)

- `authoredProperties` (serialized, edited, snapshotted) and `properties`
  (runtime, read by renderers). `update(props)` writes authored then
  re-evaluates; `toJSON` returns authored.
- `evaluate(frameData)` replaces `updateReactors`: computes the pipeline above
  and calls the existing `update` path with runtime values, exactly as reactors
  do today, so display subclasses that override `update` (e.g. `TextDisplay` →
  `CanvasText`) are untouched.
- `clip` and `isActiveAt(time)` on `Display`; `Display.create` restores `clip`.
- Simplify `useEntity`: the reactor-copy-back hack is no longer needed.

### 1.4 Gating

`updateNativeSceneState` sets a runtime flag `timelineActive` per entity for
the frame; `StageRoot` (scene skip + `<group visible>`), `SceneWithEffects`
effect filter and `isEffectEnabled` use `enabled && timelineActive !== false`.
Reactors are skipped for inactive elements. Scene-level fades apply to the
composite `opacity`; display/effect fades apply through the evaluation
pipeline (elements without `opacity` simply hard-cut).

### 1.5 Project, validation, undo

- `snapshotProject()` / `loadProject()` carry `timeline: TimelineSettings`;
  `newProject()` resets it. Older files lack it → defaults. No migration entry.
- `validation.ts`: whitelist `clip` (and `tracks` in Phase 2) in
  `validateSnapshot`; add `validateClip(clip, duration)`.
- `history.ts` snapshot includes `timeline` settings; clips ride along via
  `toJSON`. Timeline drags use `beginHistoryGesture/endHistoryGesture` (already
  bound to `pointerdown/up`), so one drag = one undo entry.

### 1.6 Actions (`src/app/actions/timeline.ts`)

`setClip(id, patch)`, `clearClip(id)`, `setProjectDuration()`, `setFps()`,
`seek/play/pause/stop`, `stepFrame(±1)`. All go through `updateElement` so the
scene store, undo and `renderer.requestRender()` stay consistent.

### 1.7 UI — bottom panel

Layout of the bottom panel becomes: waveform (acts as the ruler) → **timeline
tracks** → player controls. Timeline height is draggable via
`react-resizable-panels`; collapsible with a header toggle; state persisted in
preferences. The title-bar `PanelBottom` button keeps hiding the whole panel.

`src/components/timeline/`

- `TimelinePanel.tsx` — header (Timeline toggle, duration field, fps select,
  zoom slider, snap toggle), scrollable body, shared horizontal scroll with the
  ruler.
- `TimelineRuler.tsx` — seconds ticks, playhead, click/drag to scrub; reuses
  `CanvasAudio` bars behind it at the zoomed width (the existing
  `AudioWaveform` becomes the unzoomed overview).
- `TimelineRows.tsx` — one row per scene/effect/display in the **same order and
  nesting as the Layers panel** (reverse order, effects then displays,
  collapsible per scene). Clicking a row selects the element (`setActiveElementId`).
- `ClipBar.tsx` — bar from `start` to `end` (or project end), drag to move,
  drag edges to trim, small fade wedges at the ends; double-click resets to
  full length; selected state; snaps to whole frames and to other clip edges.
- `ClipInspector.tsx` — appears when a bar is selected: Start, End, Fade in,
  Fade out (`TimeInput`/`NumberInput`), "Clear" button.
- Right Controls panel: a trailing **Timing** `ControlGroup` on every element
  (same four fields) so the feature is discoverable and keyboard-editable
  without the timeline open.

Player controls (`PlayButtons`, `ProgressControl`, `AudioWaveform`) switch from
`player` position fractions to transport time so they work without audio and
reflect project duration. `TimeInfo` shows `time / duration`.

Keyboard (when the timeline has focus): Space play/pause, ←/→ step frame,
Shift+←/→ step second, Home/End, Delete clears clip, Ctrl/Cmd+Z/Shift+Z routed
to the existing `handleMenuAction`.

i18n: new `timeline` section in `messages/*.json` (English first; other locales
fall back to keys via `defaultValue`).

### 1.8 MCP (protocol + dispatcher)

| Tool | Args | Notes |
| --- | --- | --- |
| `get_timeline` | — | `{ time, duration, explicitDuration, fps, audioDuration, elements: [{ id, name, clip, hasTracks }] }`. Also included in `get_project`. |
| `set_timeline` | `{ duration?: number \| null, fps?: 30 \| 60 }` | `null` duration = follow audio. |
| `set_clips` | `{ clips: [{ id, start?, end?, fadeIn?, fadeOut? }] }` | Batch, idempotent merge per element; returns each element's clip. |
| `clear_clips` | `{ ids: string[] }` | |
| `playback` | `{ action: play \| pause \| stop \| seek, time?: seconds, position?: 0–1 }` | `time` preferred; `position` kept for compatibility. Works without audio. |
| `get_preview` | `{ maxSize?, time? }` | With `time`: deterministic offline render through `renderExportFrame` at that time (audio sample, reactors, clips, tracks), then restore the playhead. Without: current live behaviour. |
| `start_export` | existing + no longer requires audio when `duration` is explicit; range validated against project duration. | |

`validateSnapshot` accepts `clip`; `describe_element_type` reports whether the
type has `opacity` (so an agent knows fades will work).

### 1.9 Verification

- `pnpm lint`, `tsc --noEmit` (target: no new errors; the orphaned prototype
  files are removed/rewritten so the tree type-checks).
- Manual: load audio → bars follow audio length; set a clip → element hides
  outside it live and in export; silent project plays to 30 s; undo a drag;
  save/reopen keeps clips; open a pre-timeline `.afx` unchanged.
- MCP: `set_clips` → `get_preview({time})` before/inside/after the clip
  produces the expected frames; `start_export` on a silent project.

---

## Phase 2 — Keyframes (the "how" of the feature)

Deliverable: any numeric/colour property can change over time, from the
controls panel, the timeline, or MCP. Reactors compose with animation.

- `src/lib/timeline/tracks.ts` — port the prototype's `tracks.ts` unchanged
  (normalize, evaluate, colours in linear light, `hold` easing), plus
  `constrainNumber` using resolved control bounds (rotation unwrapped,
  scale ≥ 0).
- `Display.tracks`, serialized/restored like `clip`; evaluated in the pipeline
  before fades and reactors. `ReactorConfig.mode` (`replace|add|multiply`)
  with `replace` default so current bindings are unchanged.
- Editing semantics (from the prototype doc, kept): click ◇ next to a control
  to add a key at the playhead; editing an animated property writes/updates
  the key at the playhead; removing the last key makes the property static
  with the current value.
- UI: `KeyframeButton` in `Option`/`Control` rows for controls of type
  `number`, `color`, `colors` (`animatable` flag on the control config,
  default true for those types; plugins inherit). In the timeline, an
  animated element's row grows a **keyframe lane** under the bar (diamonds;
  drag to retime, multi-select with Shift, Delete, copy/paste at playhead,
  easing picker in the inspector). No curve editor.
- MCP:
  - `set_keyframes({ tracks: [{ id, property, keyframes: [{ time, value, easing? }], mode: 'replace' | 'merge' }] })`
  - `clear_keyframes({ id, properties?: string[] })`
  - `describe_element_type` → per control `animatable` and `easings` list;
    values validated with `validateProperties` bounds.
  - `bind_reactor` gains `mode`.
- History: tracks are in `toJSON`, so undo is automatic; per-drag gestures as
  in Phase 1.

---

## Phase 3 — Audio intelligence and sync helpers

Deliverable: agents and users place things *on the music*.

- `src/lib/audio/analysis.ts` — offline analysis of the loaded `AudioBuffer`:
  RMS energy curve (10–20 Hz resolution), spectral-flux onsets, tempo estimate
  (autocorrelation of onset strength) and a beat grid, loudness-based section
  boundaries (intro/drop/outro heuristics). Runs in a worker; cached per audio
  source. Pure functions, unit-testable.
- MCP `analyze_audio({ detail?: 'summary' | 'full' })` → `{ duration, bpm,
  confidence, beats: number[], downbeats?: number[], onsets: number[],
  sections: [{ start, end, energy }], energy: { step, values } }`.
- Markers: `TimelineSettings.markers`; `set_markers` / `clear_markers` tools;
  "Markers from beats" and "Markers from sections" buttons in the UI.
- Snapping: ruler shows beat ticks; clip edges and keyframes snap to beats,
  markers, frames and other edges (toggle in the header).
- Agent guidance in `docs/mcp.md`: recommended flow `load_media → analyze_audio
  → set_timeline → set_clips → set_keyframes → get_preview({time}) → start_export`.

---

## Phase 4 — Polish and determinism hardening

- Make core delta-accumulating effects (`Distortion`, `FilmGrain`,
  `Shockwave`, `VHS`) derive phase from `frameData.time` so backwards
  scrubbing and `get_preview({time})` are exact; `speed` keeps its meaning.
- `SaveVideoDialog`: range slider over project duration; audio optional when
  duration is explicit; range presets from markers.
- Clip operations: split at playhead, duplicate, "solo this clip" preview.
- Batch `get_preview({ times: [...] })` returning a contact sheet (one image)
  so an agent can review a sequence in a single call.
- Performance pass: memoise evaluation per entity when nothing animated, keep
  timeline rows virtualised beyond ~50 elements.
- Update `docs/mcp.md`, add `docs/timeline.md` (user-facing), delete
  `docs/keyframe-timeline.md`.

---

## File map (new / changed)

```
src/lib/timeline/transport.ts          new   project clock ↔ player
src/lib/timeline/clip.ts               new   Clip type, validate, isActiveAt, fadeEnvelope
src/lib/timeline/tracks.ts             new   (Phase 2) ported from prototype
src/lib/timeline/evaluate.ts           new   authored → runtime pipeline
src/lib/audio/analysis.ts              new   (Phase 3) beats/onsets/energy
src/lib/audio/analysis.worker.ts       new   (Phase 3)
src/lib/core/Display.ts                chg   authoredProperties, clip, tracks, evaluate
src/lib/core/Renderer.ts               chg   time in frameData, keep rendering on transport
src/lib/core/render/CompositorBackend.ts chg export time, gating flag
src/lib/core/render/StageRoot.tsx      chg   gating
src/lib/core/render/effects/*          chg   gating, time uniform
src/lib/plugins/PluginHost.ts          chg   frame.time from frameData.time
src/lib/audio/Audio.ts, Player.ts      chg   fractional seek, seekTime
src/lib/types.ts                       chg   RenderFrameData.time/fps, ReactorConfig.mode
src/lib/automation/protocol.ts         chg   new tools
src/lib/automation/dispatcher.ts       chg   handlers, deterministic preview
src/lib/automation/validation.ts       chg   clip/tracks whitelist + validators
src/app/actions/timeline.ts            new   clip/transport actions
src/app/actions/project.ts             chg   timeline settings in snapshot
src/app/actions/history.ts             chg   timeline settings in snapshot
src/app/hooks/useEntity.ts             chg   simplify
src/components/timeline/*              new   TimelinePanel, Ruler, Rows, ClipBar, Inspector, KeyframeLane
src/components/Player.tsx, PlayButtons.tsx, ProgressControl.tsx, AudioWaveform.tsx  chg  transport-driven
src/components/Control.tsx / Option.tsx chg  Timing group, KeyframeButton
src/components/SaveVideoDialog.tsx     chg   project duration, optional audio
messages/en.json                       chg   timeline strings
docs/timeline.md, docs/mcp.md          chg/new
(removed) src/lib/animation/*, src/app/actions/animation.ts, src/app/components/timeline/*, docs/keyframe-timeline.md
```

---

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Authored/runtime split regresses a display that relies on `properties` mutation. | Evaluation calls the same `update()` reactors already call every frame; add the split first, ship with no clips/tracks, verify all displays/effects/plugins render unchanged, then layer features on. |
| Transport/audio drift or double-seeks. | Audio clock is authoritative while playing; a `syncing` guard prevents feedback between transport and player events. |
| Non-deterministic effects when seeking backwards. | Documented in Phase 1, fixed in Phase 4. Export is unaffected (monotonic frames). |
| MCP agents hit the one-command-at-a-time limit. | Batch tools (`set_clips`, `set_keyframes`, `set_markers`), and `get_preview({time})` returning several frames. |
| Export without audio breaks assumptions in `startFfmpegVideoExport`. | Duration comes from the transport; audio path optional; `getAudioSample` returns silence out of range. |
| UI creep toward a pro NLE. | Scope guard: bars + fades + diamonds. No curve editor, no nested comps, no multi-track audio. |

## Sequencing and rough effort

1. Phase 1 engine (1.1–1.5): the critical path; everything else depends on it.
2. Phase 1 MCP (1.8) before Phase 1 UI (1.7): unblocks agent sync work early
   and is cheaper to verify.
3. Phase 1 UI, then Phase 2, Phase 3, Phase 4.

Estimate: Phase 1 ≈ 2 weeks, Phase 2 ≈ 1.5 weeks, Phase 3 ≈ 1 week,
Phase 4 ≈ 1 week. No test runner exists; consider adding `vitest` for the pure
modules (`clip.ts`, `tracks.ts`, `analysis.ts`) at the start of Phase 1.

## Open decisions

1. Discard the untracked prototype UI/history and port only `tracks.ts`? (Recommended.)
2. Ship Phase 1 (clips + transport + MCP) alone first, or hold for keyframes?
3. Frame rates: fixed `30 | 60` (matches export) or free integer fps?
4. Add `vitest` for the pure timeline/analysis modules?
