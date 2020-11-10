export function updateExistingProps(obj, props) {
  let changed = false;

  for (let keys = Object.keys(props), len = keys.length, i = 0; i < len; ++i) {
    const key = keys[i];
    if (obj[key] !== undefined) {
      obj[key] = props[key];
      changed = true;
    }
  }

  return changed;
}

export function resolve(value, args = []) {
  return typeof value === 'function' ? value(...args) : value;
}
