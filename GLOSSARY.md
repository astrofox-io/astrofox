# Glossary

Domain terms used in the code. Add a term when a module is named after it.

**Project**: what a user opens and saves as an `.afx` file. Its content is the Document. The Project module (`createProject` in `src/lib/project/project.ts`; the app instance is `project` in `src/app/project.ts`) is the only way to create, open or save one, and the only answer to "is it modified?". The menus and dialogs (`src/app/actions/project.ts`) and MCP automation are its two callers.

- Opening returns what could not be brought back (removed elements, missing plugins, missing media); the caller decides whether to show dialogs.
- Saving takes a `write` function (a save dialog, or a path from MCP). Once written, the project adopts the saved name, drops its unresolved media and is no longer modified, unless the Document changed while it was being written.
- Modified means the Document recorded an edit, or was replaced by undo or redo, since the project was opened, created or saved.
- Media is rewritten for saving and found again on open by the Media module.

**Document**: the editable content of a Project: canvas size and color, Scenes with their Displays and Effects, Reactors, timeline settings (duration, frame rate), the project name and unresolved media. `src/lib/document/document.ts`; the app instance is `projectDocument` in `src/app/document.ts`.

- Every edit, from the UI, MCP automation or undo, goes through `projectDocument.apply(op)`. Several ops in one call are one undo step.
- The live object graph (`stage`, `reactors`) is the only copy that is edited; the Document publishes an immutable snapshot of it for React (`useDocument`), undo and saving.
- A load (open, new project, undo, redo) replaces the whole Document and is never an undo step itself.

**Op**: one edit to the Document, e.g. `setProperties`, `removeLayer`, `bindReactor`, `setClip`. The full list is `DocumentOp` in `src/lib/document/types.ts`.

**Layer**: a Scene, Display or Effect: a row in the Layers panel.

**Scene**: a Layer that holds Displays and Effects and composites them onto the canvas.

**Display**: a Layer that draws something (image, text, spectrum, 3D geometry). Its module in `src/lib/displays` also registers the layer component that draws it (`registerDisplayLayer`, with `layer2D` or `layer3D`), so adding a display means its module, its layer component and a line in `src/lib/displays/index.ts`.

**Effect**: a Layer that post-processes its Scene (blur, glitch, VHS). Its module in `src/lib/effects` registers its render pass (`registerEffectPass`).

**Media**: an image or video file a media display (`config.media`) shows. The Media module (`createMedia` in `src/lib/media/media.ts`; the app instance is `media` in `src/app/media.ts`) is the only way media gets onto a display, whether it comes from an input, the stage, relinking or MCP. It also writes media to a project file and finds it again on open.

- `media.load({ file, path }, kind)` returns the decoded `element`, its `url` and its `sourcePath`. Setting `src` to the element makes the display fit itself to new media; setting it to the URL keeps the display's size, as relinking does.
- Images become data URLs, so a saved project carries them. Videos stream from their path (`astrofox-media:`), or from a blob URL when there is none; a project file stores only the video's path.
- Blob URLs are never revoked: undo can bring them back.

**Unresolved media**: media a project refers to that could not be found when it was opened (`MediaRef`, listed in the Relink dialog). Setting a display's `sourcePath` (new media, or none) or removing the display drops its entry; the Document does this.

**Reactor**: turns audio (or a static signal) into a 0–1 output that can drive a Layer's numeric property through a **binding** (`{ id, min, max }`).

**Authored value**: the value a person or MCP client set on a property, as opposed to the runtime value a frame renders with (after reactor output and clip fades). The Document stores authored values.

**Clip**: when a Layer is active on the timeline, with optional fades. `src/lib/timeline/clip.ts`.

**Visible**: a Layer is visible at a time when it is enabled and inside its Clip (`isVisibleAt`). Worked out from the frame's time on every frame, never kept as a flag.

**Clip edit**: a move or trim made on the timeline (`ClipEdit`). `editClip` turns it into a patch that obeys the editing rules (inside the project, at least one frame long, open clips stay open), and every clip rule lives in `clip.ts`. The Document rejects any patch that breaks them (`validateClipPatch`).

**Transport**: the project clock and the only owner of playback: playhead, play, pause, seek and loop. It plays the Document's timeline settings but does not own them. `src/lib/timeline/createTransport.ts`, wired up in `transport.ts`.

**Audio output**: what the Transport plays through (`AudioOutput`): the Web Audio Player (`playerOutput`), or a fake in tests. It is told when to play and from where, and never starts or stops on its own. "Is it playing?" is always the Transport's `playing`; the output's own state only says whether sound is coming out now (false past the end of the audio).

**Frame**: everything one picture is drawn from (`RenderFrameData`), built by the `Renderer` for one project time: the audio analysis at that time, reactor output, clip activity and fades. Anything that moves reads `frame.time`, never wall-clock time or a count of frames, so a time draws the same picture live, in a preview and in an export at any frame rate.

**Offline frame**: a frame rendered at a chosen time rather than the playhead: export frames, MCP previews at a time, saved images. They are drawn inside an offline session, `renderer.offline(fps, frames => frames.renderAt(time))` (`src/lib/core/render/offlineFrames.ts`):

- The live view pauses for the whole session, so nothing draws between a frame and reading it back. Sessions run one at a time.
- Every layer that loads asynchronously registers a **frame preparer** (`registerFramePreparer`): videos seek, worker plugins render that exact frame, images and 3D textures finish loading. A frame is drawn once they are ready (5 s at most each).
- A layer that mounts while the frame is drawn (its clip starts there) is prepared and the frame drawn again.

**Phase**: a value that advances with project time at a rate, such as an effect's speed (`src/lib/timeline/phase.ts`). At a constant rate it is exactly `rate × time`; a changing rate (driven by a reactor) is integrated, restarting after a seek.

**Command**: one MCP tool, declared once in `commands` (`src/lib/automation/protocol.ts`): its description, argument schema, **effect** (`read`, `edit` or `destructive`), whether it may run during an export, and whether its result is an image. The MCP server (`electron/mcp/server.ts`) registers tools and formats results from that table, and the editor checks every request with `parseCommand` before running its handler (`src/lib/automation/dispatcher.ts`, one per command). The table is shared by the Electron main process and the editor, so it holds no handlers.

**Platform**: what the app can ask of the machine it runs on (`platform` from `src/lib/platform`): dialogs, and on the desktop the window, files by path, the ffmpeg encoder, the updater and MCP automation. Chosen once per session: the desktop adapter over IPC, or the web adapter over browser APIs. A capability the web lacks is `null`, so code checks the capability rather than "is this desktop".

**Channel**: one IPC message between the Electron main process and the app window, declared once in `src/lib/platform/channels.ts` with its payload and result types. The main process (`electron/ipc.ts`), the preload and the desktop adapter all work from that table, and every channel answers only the app window's main frame.

**Export job**: one video export, from the save dialog or MCP (`startExport` in `src/app/actions/export.ts`). Its request is checked once by `planExport`, then an export encoder writes the file: offline (each frame rendered at its time and piped to ffmpeg) or realtime (MediaRecorder recording the canvas while the transport plays). One job runs at a time.
