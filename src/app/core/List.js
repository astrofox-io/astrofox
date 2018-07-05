import Immutable from 'immutable';

export default class List {
    constructor(values) {
        this.list = Immutable.List(values);
    }

    get length() {
        return this.list.size;
    }

    get items() {
        return this.list;
    }

    add(item) {
        this.list = this.list.push(item);
    }

    insert(index, val) {
        this.list = this.list.insert(index, val);
    }

    remove(item) {
        const { list } = this;
        const index = list.indexOf(item);

        if (index > -1) {
            this.list = list.delete(index);
            return true;
        }

        return false;
    }

    swap(index, newIndex) {
        const { list, list: { size } } = this;
        let changed = false;

        if (index !== newIndex && index > -1 && index < size && newIndex > -1 && newIndex < size) {
            this.list = list.withMutations((items) => {
                const tmp = items.get(index);
                items.set(index, items.get(newIndex));
                items.set(newIndex, tmp);
                changed = true;
            });
        }

        return changed;
    }

    clear() {
        this.list = this.list.clear();
    }

    indexOf(item) {
        return this.list.indexOf(item);
    }
}
