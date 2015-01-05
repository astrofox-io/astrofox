'use strict';

var Util = {};

// Merge object properties
Util.merge = function() {
    var obj = {},
        args = Array.prototype.slice.call(arguments);

    for (var i = args.length - 1; i > 0; i--) {
        var source = args[i];
        var target = Util.copy({}, args[i-1]);
        obj = args[i-1] = Util.copy(target, source);
    }

    return obj;
};

// Copies properties between objects
Util.copy = function(target, source) {
    target = target || {};

    for (var prop in source) {
        if (typeof source[prop] === 'object') {
            target[prop] = Util.merge(target[prop], source[prop]);
        }
        else {
            target[prop] = source[prop];
        }
    }

    return target;
};

module.exports = Util;
