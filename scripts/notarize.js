require('dotenv').config();
const { notarize } = require('electron-notarize');

const { APPLEID, APPLEIDPASS } = process.env;

(async () => {
  console.log('Staring notarize...');

  await notarize({
    appBundleId: 'io.astrofox.app',
    appPath: 'dist/mac/Astrofox.app',
    appleId: APPLEID,
    appleIdPassword: APPLEIDPASS,
  });

  console.log('Notarization complete.');
})();
