'use strict';

var _ = require('lodash');
var Immutable = require('immutable');
var THREE = require('three');
var Class = require('core/Class.js');
var NodeCollection = require('core/NodeCollection.js');
var Display = require('display/Display.js');
var CanvasDisplay = require('display/CanvasDisplay.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var Composer = require('graphics/Composer.js');

var id = 0;

var defaults = {
    blending: 'Normal',
    opacity: 1.0
};

var blendDefaults = {
    blending: THREE.NormalBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquation: THREE.AddEquation
};

var blendModes = {
    None: THREE.NoBlending,
    Normal: THREE.NormalBlending,
    Add: THREE.AdditiveBlending,
    Subtract: THREE.SubtractiveBlending
};

var Scene = function(name, options) {
    Display.call(this, id++, 'Scene', defaults);

    this.parent = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.displays = new NodeCollection();
    this.effects = new NodeCollection();
    this.blending = THREE.NormalBlending;

    this.update(options);
};

Class.extend(Scene, Display, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        this.blending = blendModes[this.options.blending];

        return changed;
    },

    addToStage: function(stage) {
        var size = stage.getSize();

        this.parent = stage;
        this.composer = new Composer(stage.renderer);

        this.canvasPass = this.composer.addCanvasPass(this.canvas);
        this.canvasPass.options.enabled = false;
        this.canvasPass.material.blending = THREE.NoBlending;

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

        this.checkDisplays();
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
        var enabled = false,
            shader = false;

        this.displays.nodes.forEach(function(display) {
            if (display instanceof CanvasDisplay) {
                enabled = true;
            }
            else if (display instanceof ShaderDisplay) {
                shader = true;
            }
        });

        this.canvasPass.options.enabled = enabled;
        this.canvasPass.material.blending = (shader) ? THREE.AdditiveBlending : THREE.NoBlending;
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

            this.composer.renderToScreen({ blending: this.blending, opacity: this.options.opacity });
            //this.composer.render();
        }

        return this.composer.readBuffer;
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