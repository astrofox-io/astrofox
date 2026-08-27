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
