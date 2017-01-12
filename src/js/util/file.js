'use strict';

const path = require('path');

function replaceExt(file, ext) {
    let base = path.basename(file, path.extname(file)) + ext;
    return path.join(path.dirname(file), base);
}

module.exports = {
    replaceExt
};