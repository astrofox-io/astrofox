# Changelog

## 2.0.0

Astrofox 2.0 is a ground-up rewrite. The app is now a Next.js / React 19 client
with a Three.js r184 render pipeline, packaged for desktop with Electron 39.
The same codebase runs on the web (https://astrofox.io) and as an offline
desktop app.

### Highlights

- **New architecture**: Next.js + React 19 + TypeScript, Three.js r184 render
  pipeline, Zustand state, Biome tooling. Electron 39 desktop shell with a
  hardened preload bridge; the renderer talks to the OS only through IPC.
- **3D scene system**: scene-wide lighting (three-light rig, toggleable
  lights), controllable camera mode with axis helper, on-stage transform
  handles, depth of field, and custom textures for 3D displays.
- **New displays**: Cubes (instanced grid, radial motion), Mesh Grid,
  Point Waves, Tunnel (fog, shader toggle, lighting-reactive), Radial Spectrum,
  Waveform Ring, plus updated Geometry, Bar/Wave Spectrum, Sound Wave, Shape,
  Image, Video and Text displays.
- **New / reworked effects**: Unreal Bloom (replaces Glow), Color (combined
  color controls), Tone Mapping, Distortion (Simplex / Perlin noise, replaces
  the standalone Perlin Noise effect), Glitch, RGB Shift, Color Halftone,
  Kaleidoscope, Lens Warp, Shockwave, Feedback, Film Grain, VHS, Scanline,
  Vignette, Edge Detection, ASCII, LED, Dot Screen, Pixelate, Mirror, Tilt
  Shift, Color Depth, Color Average, Sepia, Hue/Saturation,
  Brightness/Contrast, Blur.
- **Audio**: unified AudioReactor (beat detection + static modes), live input
  mode with desktop audio capture and MIDI support, reactor bindings on any
  numeric control.
- **Video export**: configurable encoders, quality, and frame rate; matched
  on-screen and exported colour; browser export via `MediaRecorder`
  (WebM/MP4); desktop export via bundled ffmpeg (H.264/AAC MP4) with native
  save-location prompts.
- **Plugins**: brand-new plugin system. Shader and worker display plugins are
  installed from a URL, run in a sandboxed Worker with CSP, and are managed
  from the Manage Plugins modal. Includes a plugin dev server
  (`pnpm dev:plugins`) and authoring docs (`docs/plugin-authoring.md`).
- **UI**: redesigned layout with sidebar menu, slide-out element drawer for
  displays/effects/plugins, editable project title, panel visibility toggles,
  active-layer filter, picture-in-picture stage, unified control components.
- **Localization**: client-side language switching with English, German,
  Spanish, French, Japanese, Korean, Vietnamese, Simplified Chinese and
  Traditional Chinese.
- **Auto-update**: desktop builds check GitHub Releases for updates
  (`electron-updater`).
- **Settings storage**: desktop preferences and installed plugins are stored in
  a SQLite database (`astrofox.db` in the app's user-data folder) instead of
  browser `localStorage`; the web build keeps using `localStorage`.
- **macOS**: now ships both x64 and Apple Silicon (arm64) builds (DMG + ZIP);
  hardened runtime and notarization supported.

### Upgrading from 1.x

- **Projects**: legacy `.afx` (gzip) projects open and are migrated
  automatically. Mapped elements:
  - `Glow` -> `Bloom` (`amount` -> `radius`, `intensity` -> `strength`)
  - v1 `Bloom` params rescaled to the new Bloom controls (`amount` -> `strength`,
    `threshold` -> luminance threshold)
  - `Color Halftone` (`scale` -> `radius`, `angle` -> per-channel rotation)
  - `Glitch` (`amount` -> `strength`)
  - `Geometry` lighting (`lightIntensity`/`lightDistance`/`cameraZoom` ->
    key-light + camera distance; lighting enabled)
  - `Distortion` mode `Noise` -> `Simplex Noise`; pre-release `Perlin Noise`
    effect -> `Distortion` (`Perlin Noise` mode)
  Elements that cannot be migrated are dropped and reported when the project
  opens.
- **Project format**: projects still save as `.afx`, but the file is now plain
  JSON rather than gzip-compressed. Legacy gzip `.afx` and `.json` files can
  still be opened.
- **Settings**: v1 app settings (`app.config`) are not migrated; reconfigure
  preferences in the new app. Preferences and plugins saved by 2.0 pre-release
  builds are imported automatically on first launch.
- **Plugins**: v1 plugins are not compatible and are not migrated. Reinstall
  plugins built for the new plugin system (see `docs/plugin-authoring.md`).
- **Updates**: 1.x installs will be offered 2.0.0 through the existing update
  channel; new installs update from GitHub Releases.
