const excludedFuncs = ['constructor', 'render'];
const defaultKeys = ['width', 'height', 'margin', 'padding', 'border'];

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

export function styleProps(props, keys) {
    keys = keys || defaultKeys;
    let obj = filterByKey(keys, props);

    if (typeof props.style === 'object') {
        Object.assign(obj, props.style);
    }

    return obj;
}