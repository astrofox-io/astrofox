const excludedFuncs = ['constructor', 'render'];

export function autoBind(context, excluded) {
    excluded = excluded || excludedFuncs;
    Object.getOwnPropertyNames(context.constructor.prototype).forEach(function(func) {
        if (typeof this[func] === 'function' && !excluded.includes(func)) {
            this[func] = this[func].bind(this);
        }
    }, context);
}

export function filterByKey(keys, source) {
    let obj = {};

    keys.forEach(key => {
        if (source.hasOwnProperty(key)) {
            obj[key] = source[key];
        }
    });

    return obj;
}