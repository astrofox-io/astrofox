const excludedFuncs = ['constructor', 'render'];

export function autoBind(context) {
    Object.getOwnPropertyNames(context.constructor.prototype).forEach(function(func) {
        if (typeof this[func] === 'function' && !excludedFuncs.includes(func)) {
            this[func] = this[func].bind(this);
        }
    }, context);
}

export function assignExists(dest, source) {
    let obj = Object.assign({}, dest);

    return assignKeys(Object.keys(source), obj);
}

export function assignKeys(keys, source) {
    let obj = {};

    keys.forEach(key => {
        if (source.hasOwnProperty(key)) {
            obj[key] = source[key];
        }
    });

    return obj;
}

export function styles(keys, props) {
    let obj = assignKeys(keys, props);

    if (typeof props.style === 'object') {
        Object.assign(obj, props.style);
    }

    return obj;
}