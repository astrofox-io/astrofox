import Immutable from 'immutable';

export default class NodeCollection {
    constructor(values) {
        this.nodes = new Immutable.List();
    
        if (values) {
            this.nodes = this.nodes.withMutations(list => {
                values.forEach(val => {
                    list.push(val);
                });
            });
        }
    }

    addNode(node) {
        this.nodes = this.nodes.push(node);
    }

    insertNode(index, val) {
        this.nodes = this.nodes.insert(index, val);
    }

    removeNode(node) {
        let nodes = this.nodes,
            index = nodes.indexOf(node),
            changed = false;

        if (index > -1) {
            this.nodes = nodes.delete(index);
            changed = true;
        }

        return changed;
    }

    swapNodes(index, newIndex) {
        let nodes = this.nodes,
            size = nodes.size,
            changed = false;

        if (index !== newIndex && index > -1 && index < size && newIndex > -1 && newIndex < size) {
            this.nodes = nodes.withMutations(list => {
                let tmp = list.get(index);
                list.set(index, list.get(newIndex));
                list.set(newIndex, tmp);
                changed = true;
            });
        }

        return changed;
    }

    clear() {
        this.nodes = this.nodes.clear();
    }

    indexOf(node) {
        return this.nodes.indexOf(node);
    }

    count() {
        return this.nodes.size;
    }

    toArray() {
        return this.nodes.toArray();
    }

    map(f) {
        return this.nodes.map(f);
    }
}