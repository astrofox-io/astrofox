'use strict';

function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

function round(val) {
    return (val + 0.5) << 0;
}

function ceil(val) {
    var n = (val << 0);
    return (n === val) ? n : n + 1;
}

function floor(val) {
    return ~~val;
}

function val2pct(val, min, max) {
    if (min === max) return max;

    if (val > max) val = max;
    else if (val < min) val = min;

    return (val - min) / (max - min);
}

// Math.pow(10, 0.05 * val);
function db2mag(val) {
    return Math.exp(0.1151292546497023 * val);
}

// 20 * log10(db)
function mag2db(val) {
    return 20 * log10(val);
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

function hash(s) {
    let hash = 0, i, chr, len;
    if (s.length === 0) return hash;

    for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }

    return hash;
}

module.exports = {
    clamp,
    round,
    ceil,
    floor,
    val2pct,
    db2mag,
    mag2db,
    log10,
    hash
};