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

export function getProperties(src, filter = []) {
  return Object.getOwnPropertyNames(src).reduce((obj, name) => {
    if (!filter.includes(name)) {
      obj[name] = src[name];
    }
    return obj;
  }, {});
}

export function resolve(value, args = []) {
  return typeof value === 'function' ? value(...args) : value;
}
