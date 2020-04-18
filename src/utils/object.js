export function autoBind(context, excluded = ['constructor', 'render']) {
  Object.getOwnPropertyNames(context.constructor.prototype).forEach(func => {
    if (typeof this[func] === 'function' && !excluded.includes(func)) {
      this[func] = this[func].bind(this);
    }
  }, context);
}

export function filterByKey(keys, source) {
  const obj = {};

  keys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      obj[key] = source[key];
    }
  });

  return obj;
}

export function updateExistingProps(obj, props) {
  let changed = false;
  Object.keys(props).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== props[key]) {
      obj[key] = props[key];
      changed = true;
    }
  });
  return changed;
}
