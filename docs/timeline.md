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
- Play/pause/stop and the progress bar work with or without audio. A live input
  (microphone, desktop audio, MIDI) listens while the clock plays, and the clock
  loops at the project end instead of stopping, so listening never runs out.
- **Loop** starts again from zero at the project end.
- Loading different audio, or connecting or disconnecting a live input, pauses
  playback and keeps the playhead where it is.

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

## Keyframes

Number and colour properties can change over time. Keys sit at absolute
project times, so by default moving or trimming a clip leaves its animation
where it is in the song. Turn on **Move keys** in the timeline header to have
dragging a bar carry the element's keys along (trimming never moves keys).

- Click **◇** next to a control to start animating it; the first key holds the
  current value at the playhead. Once a property is animated, editing it sets
  the key at the playhead (snapped to the frame grid), and the control shows
  the animated value as the playhead moves. ◇ is solid when a key is under the
  playhead; clicking it then removes that key.
- Removing the last key makes the property static again, at that key's value.
- Before the first key a property holds the first value, after the last key
  the last value. Each key's easing shapes the way to the next key: Linear,
  Hold (jump at the next key), Ease in, Ease out, Ease in and out. Colours blend
  in linear light.
- Rotation (and a 3D camera's azimuth) keys may hold several turns, e.g. 0° to
  720° for two spins; the control shows the angle within one turn.

On the timeline, each animated property gets a lane under its element's bar:

- Click a key to select it, `Shift`-click to add to the selection, and drag to
  move the selected keys together (they snap to clip edges, the playhead and,
  with **Snap** on, frames). Double-click a key to move the playhead to it.
- With keys selected, the header shows their easing to change, and `Delete`
  removes them (`Escape` deselects). Hold keys are drawn as squares.
- `Ctrl/Cmd+C` copies the selected keys and `Ctrl/Cmd+X` cuts them;
  `Ctrl/Cmd+V` pastes them at the playhead, keeping their spacing and easing
  and replacing keys at the same times. Keys copied from one element paste
  onto the selected element when it has the same properties, so animation can
  be carried between layers; otherwise they paste back onto their own
  element. (`Ctrl/Cmd+Shift+C/V` still copy and paste a layer's properties.)

Copy and paste of an element's properties brings its keys along, and
duplicating an element copies them.

## Reactors on animated properties

A reactor sets its bound property to its output scaled to the binding's
range, overriding the authored or keyframed value.

Clip fades always apply last, so they fade an element even when a reactor
drives its opacity.

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
`set_keyframes`, `clear_keyframes`,
`playback` (seconds and loop) and `get_preview({ time })` expose everything
above, with the same one-frame minimum clip length as the panel; see
`docs/mcp.md`. Previews at a time are rendered through the export path, so
they are exactly what the exported video contains at that time.

## Not yet

Beat/onset analysis and snapping to beats are the next phase; see
`docs/timeline-plan.md`. Step keys for switches and lists, and colour-gradient
(`colorrange`) animation are not supported.
