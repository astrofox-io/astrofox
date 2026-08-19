# Astrofox

## What is it?

Astrofox is a motion graphics program that lets turn audio into amazing videos.

<img src="https://astrofox.io/images/screenshot.jpg" width="600" />

## Quick links

- Demo video: https://www.youtube.com/watch?v=IbvuniqNPPw
- Website: https://astrofox.io
- Discord chat: https://discord.gg/wJ6pyMZ
- Reddit forum: https://www.reddit.com/r/astrofox/
- Bug tracker: https://github.com/astrofox-io/astrofox/issues

## Running Astrofox

### Get the source

```
git clone https://github.com/astrofox-io/astrofox.git
```

### Install dependencies

```
pnpm install
```

### Build the application

```
pnpm build
```

### Start the application

```
pnpm start
```

## Running for development

Run:

```
pnpm dev
```

Astrofox is a client-side Next.js app. Projects are opened and saved as local files (`.json`; legacy `.afx` gzip projects can still be opened). There is no backend or auth service required for development.

**File I/O:** web and desktop use the same browser pickers (File System Access API, with `<input>` / download fallbacks). The Electron bridge is reserved for window chrome, temp files, and **ffmpeg** export (absolute paths only when needed). See `docs/desktop-capabilities.md`.

### Web (Vercel)

Commits deploy through Vercel using the standard build:

```
pnpm build
```

Do not change this script for desktop packaging.

### Desktop (Electron, offline)

Development (Next dev server + Electron shell):

```
pnpm dev:desktop
```

Production package (static export + electron-builder):

```
pnpm install-ffmpeg   # optional; bundles ffmpeg for desktop export
pnpm build:desktop    # or dist:win / dist:mac / dist:linux
```

Desktop uses `BUILD_TARGET=desktop` for a static export into `out/`, then packages `electron/` + `out/`. The web Vercel path is unchanged.

**Video export**

- **Web:** browser `MediaRecorder` (WebM/MP4 when supported)
- **Desktop:** offline frame render → bundled **ffmpeg** → MP4 (H.264/AAC). Run `pnpm install-ffmpeg` before packaging so the binary is included under `bin/`.

## Publishing

Two independent paths from the same codebase:

| Path | Trigger | Output |
|------|---------|--------|
| **Web** | Every commit | Vercel deploy (`pnpm build`) |
| **Desktop** | Push a `v*` tag | GitHub Actions builds Windows (x64), macOS (x64 + arm64) and Linux installers and uploads them to a **draft GitHub Release** (`.github/workflows/desktop-release.yml`) |

### Cutting a desktop release

1. Bump `version` in `package.json` and update `CHANGELOG.md`.
2. Tag and push:

   ```
   git tag v2.0.0
   git push origin v2.0.0
   ```

   The workflow typechecks, lints, downloads ffmpeg, builds the static renderer, and runs
   `electron-builder --publish always` on each OS. Artifacts land on a **draft** release
   named after the tag: `Astrofox-<version>-win-x64.exe`, `-mac-{x64,arm64}.dmg` / `.zip`,
   `-linux-x64.AppImage`, plus `latest.yml`, `latest-mac.yml`, `latest-linux.yml` and
   `.blockmap` files used by the auto-updater.
3. Review the draft on GitHub, then **publish** it. Desktop 2.x installs check GitHub Releases
   via `electron-updater` and will pick up the new version once the release is published.
4. **Legacy 1.x updater**: Astrofox 1.x checks `https://files.astrofox.io/download/`. To offer
   2.x to those users, download the installers, `latest*.yml` and `*.blockmap` files from the
   GitHub release and upload them to `files.astrofox.io/download/` (same directory as the
   `.yml` files; the `url`/`path` entries in the yml are bare filenames, so no edits are needed).
   The workflow also writes identical yml files under `release/generic/` for the
   `generic` publish provider configured in `package.json`.

The workflow can also be run manually (`workflow_dispatch`), which uploads installers as CI
artifacts without creating a release. Local equivalent: `pnpm release:desktop`
(requires `GH_TOKEN`), or `pnpm dist:win` / `dist:mac` / `dist:linux` for unpublished builds
(these download ffmpeg first and fail if it is unavailable; `node scripts/install-ffmpeg.mjs --force`
re-downloads it).

### Code signing and notarization

Builds are unsigned unless the following repository secrets are set (they are passed through
to electron-builder by the workflow; `CSC_IDENTITY_AUTO_DISCOVERY` is enabled automatically
when `CSC_LINK` is present):

| Secret | Purpose |
|--------|---------|
| `CSC_LINK`, `CSC_KEY_PASSWORD` | Base64 `.p12` certificate + password (macOS Developer ID / Windows Authenticode) |
| `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | macOS notarization (`notarize: true` in `package.json`; skipped with a warning when unset) |

macOS builds use the hardened runtime with `build/entitlements.mac.plist`. Windows builds
are not yet configured with a `publisherName`; add one under `build.win` once a signing
certificate is in place so the updater can verify installers.

## License

MIT
