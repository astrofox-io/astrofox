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
