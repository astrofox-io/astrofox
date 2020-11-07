export function updateExistingProps(obj, props) {
  let changed = false;

  for (const [key, value] of Object.entries(props)) {
    if (obj[key] !== undefined) {
      obj[key] = value;
      changed = true;
    }
  }

  return changed;
}

export function resolve(value, args = []) {
  return typeof value === 'function' ? value(...args) : value;
}
