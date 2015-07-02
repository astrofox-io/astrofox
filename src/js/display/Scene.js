'use strict';

var Immutable = require('immutable');
var THREE = require('three');
var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var NodeCollection = require('core/NodeCollection.js');
var CanvasDisplay = require('display/CanvasDisplay.js');
var Composer = require('graphics/Composer.js');

var id = 0;

var Scene = function(name) {
    this.id = id++;
    this.name = name || 'Scene';
    this.displayName = this.name + '' + this.id;
    this.parent = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.displays = new NodeCollection();
    this.effects = new NodeCollection();
};

Class.extend(Scene, EventEmitter, {
    addToStage: function(stage) {
        var size = stage.getSize();

        this.parent = stage;
        this.composer = new Composer(stage.renderer);

        this.pass = this.composer.addCanvasPass(this.canvas);
        this.pass.options.enabled = false;

        this.canvas.height = size.height;
        this.canvas.width = size.width;
    },

    removeFromStage: function() {
        this.parent = null;
        this.composer.clearPasses();
        this.composer = null;
    },

    addDisplay: function(display) {
        this.displays.addNode(display);

        display.parent = this;

        if (display.addToScene) {
            display.addToScene(this);
        }

        if (display instanceof CanvasDisplay) {
            this.pass.options.enabled = true;
        }
    },

    removeDisplay: function(display) {
        this.displays.removeNode(display);

        display.parent = null;

        if (display.removeFromScene) {
            display.removeFromScene(this);
        }

        this.checkDisplays();
    },

    moveDisplay: function(display, i) {
        var index = this.displays.indexOf(display);

        this.displays.swapNodes(index, index + i);
    },

    getDisplays: function() {
        return this.displays.nodes;
    },

    checkDisplays: function() {
        var enabled = false;

        this.displays.nodes.forEach(function(display) {
            if (display instanceof CanvasDisplay) {
                enabled = true;
            }
        });

        this.pass.options.enabled = enabled;
    },

    addEffect: function(effect) {
        this.effects.addNode(effect);

        effect.parent = this;

        if (effect.addToScene) {
            effect.addToScene(this);
        }
    },

    removeEffect: function(effect) {
        this.effects.removeNode(effect);

        effect.parent = null;

        if (effect.removeFromScene) {
            effect.removeFromScene(this);
        }
    },

    moveEffect: function(effect, i) {
        var index = this.effects.indexOf(effect);

        this.effects.swapNodes(index, index + i);
    },

    getEffects: function() {
        return this.effects.nodes;
    },

    getSize: function() {
        var canvas =  this.canvas;

        return {
            width: canvas.width,
            height: canvas.height
        };
    },

    clear: function() {
        this.displays.nodes.clear();
    },

    clearCanvas: function() {
        var canvas = this.canvas,
            context = this.context;

        context.clearRect(0, 0, canvas.width, canvas.height);
    },

    render: function(data) {
        var displays = this.displays.nodes;

        this.clearCanvas();
        this.composer.clear();

        if (displays.size > 0) {
            displays.forEach(function(display) {
                if (display.renderToCanvas) {
                    display.renderToCanvas(this, data);
                }
                else if (display.updateScene) {
                    display.updateScene(this, data);
                }
            }, this);

            this.composer.renderToScreen();
        }
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