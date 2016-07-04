'use strict';

const Immutable = require('immutable');
const EventEmitter = require('../core/EventEmitter.js');

class NodeCollection extends EventEmitter { 
    constructor(values) {
        super();

        this.nodes = new Immutable.List();
    
        if (values) {
            this.nodes = this.nodes.withMutations(list => {
                values.forEach(val => {
                    list.push(val);
                    this.emit('node_added', val);
                }, this);
            });
        }
    }

    addNode(node) {
        let nodes = this.nodes;

        this.nodes = nodes.push(node);

        this.emit('node_added', node);
    }

    removeNode(node) {
        let nodes = this.nodes,
            index = nodes.indexOf(node),
            changed = false;

        if (index > -1) {
            this.nodes = nodes.delete(index);
            changed = true;
            this.emit('node_removed', node);
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
}

module.exports = NodeCollection;