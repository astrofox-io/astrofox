# Timeline

The timeline decides *when* each element is visible. It is deliberately small:
every scene, display and effect gets one bar, and that bar is the whole model.

## The project clock

Astrofox has a single project clock (the *transport*). Playback, scrubbing,
previews and video export all read time from it, in seconds from the project
start. While an audio file plays, the audio clock drives it; past the end of
the audio, or with no audio loaded, the clock keeps running on its own until
the project duration is reached.

- **Duration** follows the loaded audio by default. Type a value in the
  timeline header to make it explicit (silent intros/outros, or projects with
  no audio at all); **Auto** goes back to following the audio.
- **FPS** (30 or 60) is the frame grid used for snapping and stepping. Clip
  times are stored in seconds, so changing it never retimes anything.
- Play/pause/stop and the progress bar work with or without audio. Live inputs
  (microphone, desktop audio, MIDI) keep feeding reactors while the clock runs.

## Clips

A clip is `start`, `end` and optional `fadeIn` / `fadeOut`, all in seconds.

- An element **without** a clip is active for the whole project. Projects saved
  before the timeline existed load and behave exactly as before.
- `end` can be *until the project ends*, so a bar dragged from the start simply
  runs to the end of the project however long that becomes.
- Fades scale the element's `opacity` linearly at the clip edges. Elements
  without an opacity property hard-cut instead; the Timing group says so.
- Clips are half-open (`start` inclusive, `end` exclusive), so two clips that
  meet at the same time never overlap for a frame.

Inactive elements are skipped entirely (no drawing, no effect pass, no
reactor work), which is the same path the eye icon uses.

## The panel

Open it with the timeline button next to the loop toggle in the player. The
panel replaces the waveform overview while open; drag its top edge to resize.

- The ruler shows the waveform at the current zoom plus time ticks. Click or
  drag on it to scrub. Playback keeps the playhead in view.
- Rows mirror the Layers panel: scenes, then each scene's effects and displays,
  in the same order. Click a name to select the element; scenes collapse.
- **Drag a bar** to move it, **drag either edge** to trim, **double-click** to
  make the element always on. Edges snap to other bars, the project start/end,
  the playhead and (with **Snap** on) whole frames.
- Fades appear as darkened wedges at the ends of a bar.
- **Fit project** resets horizontal zoom and scrolling so the whole project
  duration is visible. The panel starts fitted, so clicking it then leaves
  the view unchanged. Use the zoom buttons or `Ctrl/Cmd/Alt` + wheel to zoom
  in; `\` fits again while the panel has focus.
- Keyboard while the panel has focus: `Space` play/pause, `←`/`→` step one
  frame (`Shift` for one second), `Home`/`End`, `Delete` makes the selected
  element always on, `K`/`L` pause/play.
- Every drag is one undo step; `Ctrl/Cmd+Z` works as everywhere else.

The same four values are in the controls panel under **Timing** on every
element, so timing can be typed in without opening the panel.

## Agents

The MCP tools `get_timeline`, `set_timeline`, `set_clips`, `clear_clips`,
`playback` (seconds) and `get_preview({ time })` expose everything above; see
`docs/mcp.md`. Previews at a time are rendered through the export path, so
they are exactly what the exported video contains at that time.

## Not yet

Keyframes (per-property animation over time), reactor composition modes and
beat/onset analysis are the next phases; see `docs/timeline-plan.md`.
