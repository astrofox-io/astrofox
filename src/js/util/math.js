'use strict';

// Fast rounding
function round(val) {
    return (val + 0.5) << 0;
}

// Fast ceiling
function ceil(val) {
    var n = (val << 0);
    return (n === val) ? n : n + 1;
}

// Fast floor
function floor(val) {
    return ~~val;
}

// Clamps value between min and max
function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

// Round to nearest given interval
function roundTo(num, step) {
    let d = decimals(step),
        n = ceil(num / step) * step;

    return (d > 0) ? n.toFixed(d) : n;
}

// Decimal places in a number
function decimals(num) {
    if (num % 1 !== 0) {
        return num.toString().split('.')[1].length;
    }
    return 0;
}

// Percent value of a number in a range
function val2pct(val, min, max) {
    if (min === max) return max;

    if (val > max) val = max;
    else if (val < min) val = min;

    return (val - min) / (max - min);
}

// Decibels to magnitude: Math.pow(10, 0.05 * val);
function db2mag(val) {
    return Math.exp(0.1151292546497023 * val);
}

// Magnitude to decibels: 20 * log10(db)
function mag2db(val) {
    return 20 * log10(val);
}

// Log base 10
function log10(val) {
    return Math.log(val) / Math.LN10;
}

// Degrees to radians
function deg2rad(val) {
    return val * 0.017453292519943295;
}

// Radians to degrees
function rad2deg(val) {
    return val * 57.29577951308232;
}

// Hash code of a string
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
    round,
    ceil,
    floor,
    clamp,
    roundTo,
    decimals,
    val2pct,
    db2mag,
    mag2db,
    log10,
    deg2rad,
    rad2deg,
    hash
};