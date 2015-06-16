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
    this.displays = new NodeCollection();
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
};

Class.extend(Scene, EventEmitter, {
    addToStage: function(stage) {
        this.parent = stage;
        this.composer = new Composer(stage.renderer);
        this.canvasPass = this.composer.addCanvasPass(this.canvas);
        this.canvasPass.options.enabled = false;

        this.canvas.height = stage.options.height;
        this.canvas.width = stage.options.width;
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

        if (display instanceof CanvasDisplay) {
            this.canvasPass.options.enabled = true;
        }
    },

    removeDisplay: function(display) {
        this.displays.removeNode(display);

        display.parent = null;

        if (this.displays.size == 0) {
            this.canvasPass.options.enabled = false;
        }

        if (display.removeFromScene) {
            display.removeFromScene(this);
        }
    },

    moveDisplay: function(display, i) {
        var index = this.displays.indexOf(display);

        this.displays.swapNodes(index, index + i);
    },

    getDisplays: function() {
        return this.displays.nodes;
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
        this.clearCanvas();

        this.displays.nodes.forEach(function(display) {
            if (display.renderToCanvas) {
                display.renderToCanvas(this, data);
            }
        }, this);

        this.composer.renderToScreen();
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