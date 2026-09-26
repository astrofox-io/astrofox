# Astrofox MCP

The desktop application can expose its running editor through a local Model
Context Protocol server. It uses Streamable HTTP and the official TypeScript SDK.
The web build does not open a server. There is no headless renderer or stdio
adapter in this version.

## Enable and connect

Open **Settings → MCP server** and turn on **Enable MCP server**. The server
starts immediately. Turning the setting off closes the listener and connected
clients. The choice is remembered, so an enabled server starts with Astrofox on
future launches. MCP is disabled by default.

Copy the **Server URL** and **Bearer token** from the same panel into your MCP
client. The token stays the same across app restarts and disable/enable cycles.
**Reset token** replaces it and disconnects existing clients; update those clients
with the new token before reconnecting.

No environment variables or special launch command are required. For development,
use the normal desktop command:

```sh
pnpm dev:desktop
```

When upgrading from a version without the settings bridge, restart the desktop
app once to load the new main-process and preload code. Subsequent setting changes
do not require a restart.

Packaged builds include the MCP runtime; Node and pnpm are not needed to serve MCP.

Preferences are stored in `mcp-settings.json` in Electron's user-data directory.
Existing `mcp.json` credentials are preserved on migration when available. The
legacy environment variables below seed preferences **only on the first launch
without saved MCP settings**. After that, the saved choice takes precedence.

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `ASTROFOX_MCP` | disabled | Set to `1` to initially enable the server |
| `ASTROFOX_MCP_PORT` | `43120` | Loopback TCP port |
| `ASTROFOX_MCP_TOKEN` | Random, persisted | Optional initial bearer token, 32–256 printable non-space ASCII characters |

The development launcher loads `.env`. The legacy `pnpm dev:desktop:mcp` command
still seeds initial enablement, but does not override a saved disabled setting.
Do not commit credentials.

On successful startup, Astrofox writes `mcp.json` to Electron's user-data directory
and logs the file's location without printing the token. It contains:

```json
{
  "url": "http://127.0.0.1:43120/mcp",
  "token": "<generated token>"
}
```

The usual Windows location is `%APPDATA%\astrofox\mcp.json`; the startup log is
authoritative if the app's user-data location differs. Add a Streamable HTTP server
to your MCP client using that URL and the header:

```text
Authorization: Bearer <token from mcp.json>
```

Client configuration formats differ. A client running on another machine or in a
remote container cannot reach this loopback endpoint directly. If startup fails,
the settings panel shows the error and offers **Retry**. The rest of Astrofox
continues working. Disabling MCP does not undo completed commands or cancel an
already-started video export; use the export cancellation control for that.

## Tools

| Tools | Purpose |
| --- | --- |
| `get_project` | Inspect live project state, audio and missing media; omit embedded media bytes |
| `list_element_types`, `describe_element_type` | Discover installed types, defaults, controls and current bounds |
| `new_project`, `open_project`, `save_project` | Manage local `.afx` projects without dialogs |
| `create_scene`, `add_element`, `update_element`, `remove_element`, `reorder_element` | Edit scenes, displays and effects |
| `configure_canvas` | Set dimensions and background color |
| `create_reactor`, `update_reactor`, `remove_reactor`, `bind_reactor` | Configure audio-reactive properties |
| `load_media`, `playback` | Load local audio/images/videos and play, pause or seek |
| `get_preview` | Return the rendered composition as a bounded PNG image |
| `start_export`, `get_export_status`, `cancel_export` | Start and monitor cancellable offline video exports |

Call `list_element_types`, then `describe_element_type` before choosing properties.
Type names are exact, for example `TextDisplay` and `BloomEffect`. Use returned
element IDs for subsequent commands. Describe an existing element with `elementId`
to resolve controls against its media and current properties.

Example tool arguments, in order:

```json
{"tool":"create_scene","arguments":{"name":"MCP composition"}}
{"tool":"add_element","arguments":{"sceneId":"<returned scene ID>","type":"TextDisplay","properties":{"text":"Hello Astrofox","size":72,"color":"#FFFFFF"}}}
{"tool":"get_preview","arguments":{"maxSize":1024}}
{"tool":"save_project","arguments":{"path":"E:\\projects\\hello.afx"}}
```

These are examples of tool calls, not raw JSON-RPC request envelopes.

## Behavior and limits

- File operations use absolute local paths. Inputs are limited to 256 MiB. The
  token authorizes local file access through these tools; protect it accordingly.
- Saving an existing project or exporting over an existing video requires
  `overwrite: true`. Video output also uses ffmpeg's no-overwrite mode by default,
  so a file created during rendering is not silently replaced.
- Opening or creating a project with unsaved changes fails unless
  `discardChanges: true` is supplied. Opening shares the existing migration path,
  including gzip `.afx` support, and reports missing media/plugins as warnings.
  It does not automatically install plugins. Audio is loaded separately, as with
  the existing project format.
- Use `load_media` instead of setting `src` or `sourcePath` directly. Numeric
  controls use resolved bounds, and unsupported properties are rejected.
- Commands run one at a time. Concurrent calls receive a retryable busy error;
  the server does not silently queue edits. A 60-second timeout reports an unknown
  outcome and blocks further commands until the editor reloads. Inspect state
  after reloading before repeating a mutation.
- Previews capture the current live composition, not a deterministic timestamp.
  They wait for a compositor presentation and font readiness. External plugins
  and independently loading remote textures may need another preview call.
- Exports require loaded audio for their duration and analysis, even when
  `includeAudio` is false. Supported frame rates are 30 and 60; available encoders
  are x264, x265, NVENC and WebM. NVENC requires compatible hardware. Use `.webm`
  for WebM and `.mp4` for the other encoders, with even canvas dimensions.
- `start_export` returns a job ID immediately. Poll `get_export_status` until
  `completed`, `cancelled` or `failed`. The most recent 50 jobs live in renderer
  memory and do not survive reload. Other MCP mutations and previews are blocked
  while an export runs. Avoid manually editing the composition during export.
- The endpoint binds only to `127.0.0.1`, requires a bearer token, validates Host
  and Origin, limits request bodies to 1 MiB, and uses explicit IPC methods. It
  exposes no arbitrary JavaScript evaluation, shell command or raw ffmpeg tool.

## Implementation and validation

- `src/lib/automation/protocol.ts`: shared Zod tool contracts.
- `src/lib/automation/dispatcher.ts`: live renderer command handlers.
- `src/lib/automation/validation.ts`: control and project validation.
- `electron/mcp/server.ts`: HTTP MCP server, IPC routing and local file operations.
- `electron/mcp-controller.mjs`: persistent preferences, token management, and serialized start/stop operations.
- `src/components/McpSettings.tsx`: desktop settings and connection details.
- `electron/preload.mjs`: isolated command/reply bridge.
- `scripts/build-mcp.mjs`: bundles the SDK and server into
  `electron/generated/mcp-server.mjs`. This generated file is ignored by git and
  included in desktop packaging under the existing `electron/**/*` rule.

`pnpm build:mcp` rebuilds the server. Desktop dev and renderer packaging scripts
run this automatically. Changes to the main process require a desktop restart.

Before shipping, verify in a running desktop session: connect and discover tools;
create/edit a scene and check the UI and preview; save/reopen a project; load media;
export a short clip; cancel a second export; and reconnect after a renderer reload.
Toggle the server off/on, restart the app, and reset its token to check settings
persistence and connection lifecycle.
Also check that invalid properties, missing authentication and accidental file
overwrites fail without changing the project.
