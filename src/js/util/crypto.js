'use strict';

const crypto = window.require('crypto');

function sha1(s) {
    return crypto.createHash('sha1').update(s).digest('hex');
}

function sha256(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
}

function uniqueId() {
    return crypto.randomBytes(16).toString('hex');
}

module.exports = {
    sha1,
    sha256,
    uniqueId
};