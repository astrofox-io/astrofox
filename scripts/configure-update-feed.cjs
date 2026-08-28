/**
 * electron-builder `afterPack` hook that writes `app-update.yml` into the app's
 * resources directory. `electron-updater` reads this file at runtime to find
 * the update feed (GitHub Releases for astrofox-io/astrofox).
 *
 * DO NOT REMOVE. electron-builder writes this file itself for Windows (nsis),
 * Linux (AppImage/deb/rpm) and one-shot macOS builds, so for those targets this
 * hook is merely redundant. It is REQUIRED for the signed macOS path in
 * .github/workflows/package-installers.yml, which builds in two steps:
 *
 *   1. `electron-builder --mac dir` — electron-builder's own PublishManager
 *      skips writing app-update.yml on darwin unless the targets include
 *      dmg or zip, so a `dir` build gets nothing.
 *   2. `electron-builder --mac dmg zip --prepackaged Astrofox.app` — with
 *      `--prepackaged`, doPack() returns early and no afterPack hooks run at all.
 *
 * Without this hook the notarized .app would ship with no app-update.yml and
 * macOS auto-updates would silently never work. Writing it here (during step 1)
 * also ensures the file is inside the code-signed/notarized bundle.
 *
 * The output is byte-identical to what electron-builder generates from
 * `build.publish` in package.json; `updaterCacheDirName` matches its default
 * of `<name>-updater`. Keep both in sync if either changes.
 */
const fs = require('node:fs/promises');
const path = require('node:path');

function getResourcesDirectory(context) {
  if (context.electronPlatformName === 'darwin') {
    return path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.app`,
      'Contents',
      'Resources',
    );
  }

  return path.join(context.appOutDir, 'resources');
}

exports.default = async function configureUpdateFeed(context) {
  const updateConfigPath = path.join(getResourcesDirectory(context), 'app-update.yml');
  const updateConfig = `provider: github
owner: astrofox-io
repo: astrofox
updaterCacheDirName: astrofox-updater
`;

  await fs.writeFile(updateConfigPath, updateConfig, 'utf8');
};
