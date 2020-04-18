export default class List {
  constructor(items = []) {
    this.items = items;
  }

  add(item) {
    this.items.push(item);
  }

  insert(index, item) {
    this.items.splice(index, 0, item);
  }

  remove(item) {
    const { items } = this;
    const index = items.indexOf(item);

    if (index > -1) {
      delete items[index];
      this.items = items.filter(n => n);
      return true;
    }

    return false;
  }

  swap(index, newIndex) {
    const { items } = this;
    let changed = false;

    if (
      index !== newIndex &&
      index > -1 &&
      index < items.length &&
      newIndex > -1 &&
      newIndex < items.length
    ) {
      const tmp = items[index];
      items[index] = items[newIndex];
      items[newIndex] = tmp;
      changed = true;
    }

    return changed;
  }

  clear() {
    this.items = [];
  }
}
