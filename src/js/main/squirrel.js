const path = require('path');
const spawn = require('child_process').spawn;
const app = require('electron').app;
const debug = require('debug')('astrofox');

let run = function(args, done) {
    let updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');

    debug('Spawning `%s` with args `%s`', updateExe, args);

    spawn(updateExe, args, {
        detached: true
    }).on('close', done);
};

let check = function() {
    if (process.platform === 'win32') {
        let cmd = process.argv[1];

        debug('Processing squirrel command `%s`', cmd);

        let target = path.basename(process.execPath);

        if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
            run(['--createShortcut=' + target + ''], app.quit);
            return true;
        }
        if (cmd === '--squirrel-uninstall') {
            run(['--removeShortcut=' + target + ''], app.quit);
            return true;
        }
        if (cmd === '--squirrel-obsolete') {
            app.quit();
            return true;
        }
    }
    return false;
};

module.exports = check;