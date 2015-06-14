'use strict';

var Immutable = require('immutable');
var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var NodeCollection = require('core/NodeCollection.js');
var Composer = require('graphics/Composer.js');

var id = 0;

var Scene = function(name) {
    this.id = id++;
    this.name = name || 'Scene';
    this.displayName = this.name + '' + this.id;
    this.parent = null;
    this.displays = new NodeCollection();
};

Class.extend(Scene, EventEmitter, {
    addToStage: function(stage) {
        this.parent = stage;
        //this.composer = new Composer(stage.renderer);
    },

    removeFromStage: function(stage) {
        this.parent = null;
        this.composer = null;
    },

    addDisplay: function(display) {
        this.displays.addNode(display);

        display.parent = this;

        if (display.addToScene) {
            display.addToScene(this);
        }
    },

    removeDisplay: function(display) {
        this.displays.removeNode(display);

        display.parent = null;

        if (display.removeFromScene) {
            display.removeFromScene(this);
        }
    },

    moveDisplay(display, i) {
        var index = this.displays.indexOf(display);

        this.displays.swapNodes(index, index + i);
    },

    getDisplays() {
        return this.displays.nodes;
    },

    clear: function() {
        this.displays.clear();
    },

    toString: function() {
        return this.name + '' + this.id;
    },

    toJSON: function() {
        var displays = this.displays.map(function(display) {
            return display.toJSON();
        });

        return {
            name: this.name,
            displays: displays
        };
    }
});

module.exports = Scene;