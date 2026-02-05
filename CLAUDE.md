# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astrofox is an Electron-based audio-reactive motion graphics application that creates videos from audio. Built with React 18, Three.js for WebGL rendering, and Zustand for state management.

## Commands

```bash
# Development - starts webpack watch + electron
pnpm dev

# Build production
pnpm build

# Run tests with coverage
pnpm test

# Lint and fix
pnpm lint-fix

# Platform-specific builds
pnpm build-win    # Windows NSIS installer
pnpm build-mac    # macOS DMG
pnpm build-linux  # Linux AppImage

# First-time setup
pnpm install && pnpm install-ffmpeg
```

## Architecture

### Rendering Pipeline
- **Core display system** (`src/core/`): Base `Entity` and `Display` classes. `Scene` acts as compositor supporting blend modes and opacity.
- **WebGL rendering** (`src/graphics/`): Three.js-based with `Composer` for post-processing. `Pass` classes handle render passes, `ShaderPass` for custom GLSL shaders.
- **Effects** (`src/effects/`): Visual effects extending base `Effect` class (bloom, blur, glitch, etc.)
- **Shaders** (`src/shaders/`): GLSL vertex/fragment shaders in `glsl/` subdirectory with JS wrapper classes.

### Audio System
- `src/audio/AudioReactor.js`: Audio reactivity system connecting audio analysis to visual properties
- `src/audio/FFTParser.js`: FFT spectrum analysis
- `src/audio/SpectrumAnalyzer.js`: Frequency-based visualization data

### Canvas Displays
`src/canvas/` contains canvas-based visualizers: `CanvasBars`, `CanvasWave`, `CanvasText`, `CanvasShape`, `CanvasImage`

### Video Export
Multi-process system in `src/video/`:
- `VideoRenderer.js`: Orchestrates export
- `RenderProcess.js`, `AudioProcess.js`, `MergeProcess.js`: Separate processes for FFmpeg operations

### React UI
`src/view/` contains the React application:
- Entry: `index.js` → `components/App.js`
- State: Zustand stores in `stores.js`
- Styles: LESS files in `styles/`

### Electron
`src/main/` contains main process code:
- Entry: `index.js`
- IPC handlers in `api/`
- Window management in `window.js`

## Code Style

- ESLint with Airbnb config (relaxed)
- Biome for linting and formatting
- LESS for stylesheets
- Pre-commit hooks enforce linting

## Adding New Features

**New effect**: Create class in `src/effects/` extending `Effect`, add corresponding shader in `src/shaders/`

**New display type**: Extend `Display` class in `src/core/`, add to `src/displays/`

**New canvas visualizer**: Add to `src/canvas/` following existing patterns

**New React component**: Add to `src/view/components/` with LESS styles in `src/view/styles/`
