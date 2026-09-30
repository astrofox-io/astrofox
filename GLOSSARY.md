# Glossary

Domain terms used in the code. Add a term when a module is named after it.

**Project**: what a user opens and saves as an `.afx` file. Its content is the Document; its save state (opened, last modified) lives in `projectStore` (`src/app/actions/project.ts`).

**Document**: the editable content of a Project: canvas size and color, Scenes with their Displays and Effects, Reactors, timeline settings (duration, frame rate), the project name and unresolved media. `src/lib/document/document.ts`; the app instance is `projectDocument` in `src/app/document.ts`.

- Every edit, from the UI, MCP automation or undo, goes through `projectDocument.apply(op)`. Several ops in one call are one undo step.
- The live object graph (`stage`, `reactors`) is the only copy that is edited; the Document publishes an immutable snapshot of it for React (`useDocument`), undo and saving.
- A load (open, new project, undo, redo) replaces the whole Document and is never an undo step itself.

**Op**: one edit to the Document, e.g. `setProperties`, `removeLayer`, `bindReactor`, `setClip`. The full list is `DocumentOp` in `src/lib/document/types.ts`.

**Layer**: a Scene, Display or Effect: a row in the Layers panel.

**Scene**: a Layer that holds Displays and Effects and composites them onto the canvas.

**Display**: a Layer that draws something (image, text, spectrum, 3D geometry).

**Effect**: a Layer that post-processes its Scene (blur, glitch, VHS).

**Reactor**: turns audio (or a static signal) into a 0–1 output that can drive a Layer's numeric property through a **binding** (`{ id, min, max }`).

**Authored value**: the value a person or MCP client set on a property, as opposed to the runtime value a frame renders with (after reactor output and clip fades). The Document stores authored values.

**Clip**: when a Layer is active on the timeline, with optional fades. `src/lib/timeline/clip.ts`.

**Visible**: a Layer is visible at a time when it is enabled and inside its Clip (`isVisibleAt`). Worked out from the frame's time on every frame, never kept as a flag.

**Clip edit**: a move or trim made on the timeline (`ClipEdit`). `editClip` turns it into a patch that obeys the editing rules (inside the project, at least one frame long, open clips stay open), and every clip rule lives in `clip.ts`. The Document rejects any patch that breaks them (`validateClipPatch`).

**Transport**: the project clock: playhead, play and pause. It plays the Document's timeline settings but does not own them. `src/lib/timeline/transport.ts`.

**Frame**: everything one picture is drawn from (`RenderFrameData`), built by the `Renderer` for one project time: the audio analysis at that time, reactor output, clip activity and fades. Anything that moves reads `frame.time`, never wall-clock time or a count of frames, so a time draws the same picture live, in a preview and in an export at any frame rate.

**Offline frame**: a frame rendered at a chosen time rather than the playhead: export frames, MCP previews at a time, saved images (`renderer.renderAt(time, fps)`). Layers that load asynchronously (videos, worker plugins) are made ready for that exact time before it is captured (`framePreparation.ts`).

**Phase**: a value that advances with project time at a rate, such as an effect's speed (`src/lib/timeline/phase.ts`). At a constant rate it is exactly `rate × time`; a changing rate (driven by a reactor) is integrated, restarting after a seek.
