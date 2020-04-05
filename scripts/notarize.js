require('dotenv').config();
const { notarize } = require('electron-notarize');

const { APPLEID, APPLEIDPASS } = process.env;

(async function notarizing() {
  console.log('Staring notarize...');

  const result = await notarize({
    appBundleId: 'io.astrofox.app',
    appPath: 'dist/mac/Astrofox.app',
    appleId: APPLEID,
    appleIdPassword: APPLEIDPASS,
  });

  console.log('Notarization complete.', result);
})();
