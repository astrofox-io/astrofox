'use strict';

var Immutable = require('immutable');
var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');

var NodeCollection = function() {
    this.nodes = new Immutable.List();
};

Class.extend(NodeCollection, EventEmitter, {
    addNode: function(node) {
        var nodes = this.nodes;

        this.nodes = nodes.push(node);

        this.emit('node_added', node);
    },

    removeNode: function(node) {
        var nodes = this.nodes,
            index = nodes.indexOf(node);

        if (index > -1) {
            this.nodes = nodes.delete(index);

            this.emit('node_removed', node);
        }
    },

    swapNodes: function(index, newIndex) {
        var nodes = this.nodes,
            size = nodes.size;

        if (index !== newIndex && index > -1 && index < size && newIndex > -1 && newIndex < size) {
            this.nodes = nodes.withMutations(function(list) {
                var tmp = list.get(index);
                list.set(index, list.get(newIndex));
                list.set(newIndex, tmp);
            });
        }
    },

    clear: function() {
        this.nodes.clear();
    },

    indexOf: function(node) {
        return this.nodes.indexOf(node);
    }
});

module.exports = NodeCollection;