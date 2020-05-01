export function isDefined(...arr) {
  return arr.filter(e => e !== undefined).length > 0;
}
