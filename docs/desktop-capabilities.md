# Desktop capabilities

Astrofox is one React app. Desktop is the same UI inside Electron. Use **web APIs by default**, and the desktop only for what the browser cannot do. App code reaches the machine through one interface, `platform` from `src/lib/platform`, never through the preload bridge directly.

Opt-in [MCP automation](mcp.md) uses a dedicated command/reply bridge and explicit
path-based project/media operations because MCP clients cannot use browser file
pickers. Interactive file operations continue to follow the policy below.

## Principle

| Need | Approach |
|------|----------|
| Open/save project, images, audio | File System Access API / `<input>` / download (same as web) |
| Preview video | `blob:` URL; optional `astrofox-media://` when a real path exists |
| Offline MP4 export | Bundled **ffmpeg** (`platform.encoder`) |
| Window chrome | `platform.window` (min / max / close / state) |
| Reveal export in folder | `platform.files.reveal` |

## The platform

`platform` is chosen once per session (`src/lib/platform/index.ts`): the
desktop adapter over IPC (`desktop.ts`) when the preload exposed its bridge, the
web adapter (`web.ts`) otherwise. What only the desktop can do is `null` on the
web, so code checks the capability, not "is this desktop":

| Capability | Web | Desktop |
|------------|-----|---------|
| `dialogs` | File System Access / `<input>` / download | Same, plus native dialogs with `preferNativePath` |
| `window` | `null` | Frameless window chrome and its state |
| `files` | `null` | Files by absolute path, the temp directory, reveal in folder |
| `encoder` | `null` | ffmpeg, when the binary is installed |
| `updater` | `null` | Auto-update in packaged builds |
| `automation` | `null` | The MCP command channel and its settings |

Settings storage is its own seam (`src/lib/storage`); its desktop backend is the
preload's SQLite-backed store.

### Opt-in only (`preferNativePath: true`)

Native dialogs are used only when a real path is required, such as the ffmpeg
export's output. App code must **not** default open/save through native
dialogs. See `api.showOpenDialog` / `api.showSaveDialog`.

## Adding a desktop capability

Every IPC channel is one entry in `src/lib/platform/channels.ts`, with its
payload and result types. That table is the whole contract:

1. Add the channel to the table.
2. Handle it in the main process with `handle()` from `electron/ipc.ts`. It
   refuses names that are not in the table, and answers only the app window's
   main frame, for every channel.
3. Call it from `src/lib/platform/desktop.ts` (typed from the table) and add it
   to the `Platform` interface in `types.ts`, with a `null` or browser version
   in `web.ts`.

The preload (`electron/preload.ts`) exposes exactly the table's channels, so it
needs no change. `pnpm build:electron` bundles the preload, `electron/ipc.ts`
and the MCP server into `electron/generated/`.

### Protocols (main process)

| Protocol | Role |
|----------|------|
| `astrofox://` | Packaged static renderer |
| `astrofox-media://` | Range-stream local video files by absolute path |

## Export modes

1. **ffmpeg** (desktop when binary present): offline frames → H.264/AAC MP4; save location uses `preferNativePath`.
2. **MediaRecorder** (web, or desktop without ffmpeg): canvas capture; save via File System Access or download.
