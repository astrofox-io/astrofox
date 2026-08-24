const fs = require('node:fs/promises');
const path = require('node:path');

function getUpdateFeedUrl() {
  const rawUrl = process.env.ASTROFOX_UPDATE_FEED_URL?.trim();

  if (!rawUrl) {
    throw new Error(
      'Missing ASTROFOX_UPDATE_FEED_URL. Set it to the public R2 releases URL, for example https://files.astrofox.io/releases.',
    );
  }

  return rawUrl.replace(/\/+$/, '');
}

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
  const updateConfig = `provider: generic
url: ${getUpdateFeedUrl()}
updaterCacheDirName: astrofox-updater
`;

  await fs.writeFile(updateConfigPath, updateConfig, 'utf8');
};
