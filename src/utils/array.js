export function insert(arr, index, item) {
  arr.splice(index, 0, item);
}

export function remove(arr, item) {
  arr.splice(arr.indexOf(item), 1);
}

export function swap(arr, index, newIndex) {
  if (
    index !== newIndex &&
    index > -1 &&
    index < arr.length &&
    newIndex > -1 &&
    newIndex < arr.length
  ) {
    const tmp = arr[index];
    arr[index] = arr[newIndex];
    arr[newIndex] = tmp;
  }
}

export function hasDefined(...arr) {
  return arr.filter(e => e !== undefined).length > 0;
}
