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
| **Desktop** | Push a `v*` tag | GitHub Actions builds Windows/macOS/Linux installers and uploads them to a **draft GitHub Release** (`.github/workflows/desktop-release.yml`) |

To cut a desktop release:

```
git tag v2.0.0
git push origin v2.0.0
```

Then review and publish the draft release on GitHub. The workflow can also be run manually (`workflow_dispatch`), which uploads installers as CI artifacts without creating a release. Local equivalent: `pnpm release:desktop` (requires `GH_TOKEN`).

Code signing is currently disabled in CI (`CSC_IDENTITY_AUTO_DISCOVERY=false`); add signing cert secrets (`CSC_LINK`/`CSC_KEY_PASSWORD`) and remove that env var to enable it.

## License

MIT
