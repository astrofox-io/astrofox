# Desktop capabilities

Astrofox is one React app. Desktop is the same UI inside Electron. Use **web APIs by default**; the preload bridge (`window.__ASTROFOX__`) only for what the browser cannot do.

## Principle

| Need | Approach |
|------|----------|
| Open/save project, images, audio | File System Access API / `<input>` / download (same as web) |
| Preview video | `blob:` URL; optional `astrofox-media://` when a real path exists |
| Offline MP4 export | Bundled **ffmpeg** via bridge |
| Window chrome | Bridge (min / max / close / state) |
| Reveal export in folder | Bridge |

## Bridge methods

### Required (keep)

| Method | Why |
|--------|-----|
| `getEnvironment` | Paths, versions, `FFMPEG_*` |
| `minimizeWindow` / `maximizeWindow` / `closeWindow` / `getWindowState` / `onWindowStateChanged` | Frameless window |
| `ffmpegRun` / `ffmpegStartPipe` / `ffmpegWrite` / `ffmpegEndPipe` / `ffmpegKill` | Offline encode |
| `writeTempFile` / `removePath` | Temp audio/intermediates for ffmpeg |
| `showItemInFolder` / `openPath` | OS integration after export |

### Opt-in only (`preferNativePath: true`)

| Method | When |
|--------|------|
| `showSaveDialog` | FFmpeg export needs an absolute output path |
| `showOpenDialog` + `readFile` | Rare flows that need a real path (prefer web pickers otherwise) |
| `writeFile` | Writing to an absolute path from a native save dialog |

App code must **not** default open/save through native dialogs. See `api.showOpenDialog` / `api.showSaveDialog` and `preferNativePath`.

### Protocols (main process)

| Protocol | Role |
|----------|------|
| `astrofox://` | Packaged static renderer |
| `astrofox-media://` | Range-stream local video files by absolute path |

## Export modes

1. **ffmpeg** (desktop when binary present): offline frames → H.264/AAC MP4; save location uses `preferNativePath`.
2. **MediaRecorder** (web, or desktop without ffmpeg): canvas capture; save via File System Access or download.
