'use strict';

const excludedFuncs = ['constructor', 'render'];

function autoBind(context) {
    Object.getOwnPropertyNames(context.constructor.prototype).forEach(function(func) {
        if (typeof this[func] === 'function' && !excludedFuncs.includes(func)) {
            this[func] = this[func].bind(this);
        }
    }, context);
}

function assignIn(dest, source) {
    let obj = Object.assign({}, dest);

    Object.keys(source).forEach(prop => {
        if (obj.hasOwnProperty(prop) && obj[prop] !== source[prop]) {
            obj[prop] = source[prop];
        }
    });

    return obj;
}

module.exports = {
    autoBind,
    assignIn
};