import produce from 'immer';

export function add(arr, item) {
  return produce(arr, draft => {
    draft.push(item);
  });
}

export function insert(arr, index, item) {
  return produce(arr, draft => {
    draft.splice(index, 0, item);
  });
}

export function remove(arr, item) {
  return produce(arr, draft => {
    draft.splice(draft.indexOf(item), 1);
  });
}

export function swap(arr, index, newIndex) {
  return produce(arr, draft => {
    if (
      index !== newIndex &&
      index > -1 &&
      index < arr.length &&
      newIndex > -1 &&
      newIndex < arr.length
    ) {
      const tmp = draft[index];
      draft[index] = draft[newIndex];
      draft[newIndex] = tmp;
    }
  });
}
