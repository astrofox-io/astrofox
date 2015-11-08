'use strict';

var _ = require('lodash');
var Immutable = require('immutable');
var THREE = require('three');
var Class = require('core/Class.js');
var NodeCollection = require('core/NodeCollection.js');
var Display = require('display/Display.js');
var CanvasDisplay = require('display/CanvasDisplay.js');
var Effect = require('effects/Effect.js');
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
    Subtract: THREE.SubtractiveBlending,
    Multiply: THREE.MultiplyBlending
};

var Scene = function(name, options) {
    Display.call(this, id++, 'Scene', defaults);

    this.parent = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.displays = new NodeCollection();
    this.effects = new NodeCollection();

    this.update(options);
};

Class.extend(Scene, Display, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        if (this.canvasPass) {
            this.canvasPass.material.blending = (this.options.blending == 'Normal') ? THREE.NoBlending : THREE.NormalBlending;
        }

        return changed;
    },

    addToStage: function(stage) {
        var size = stage.getSize();

        this.parent = stage;
        this.composer = new Composer(stage.renderer);

        this.canvasPass = this.composer.addCanvasPass(this.canvas);
        this.canvasPass.material.blending = (this.options.blending == 'Normal') ? THREE.NoBlending : THREE.NormalBlending;
        this.canvasPass.options.enabled = false;

        this.canvas.height = size.height;
        this.canvas.width = size.width;
    },

    removeFromStage: function() {
        this.parent = null;
        this.displays.clear();
        this.displays = null;
        this.effects.clear();
        this.effects = null;
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
        var enabled = false;

        this.displays.nodes.forEach(function(display) {
            if (display instanceof CanvasDisplay) {
                enabled = true;
            }
        });

        this.canvasPass.options.enabled = enabled;
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
        var displays = this.displays.nodes,
            options = this.options,
            composer = this.composer;

        this.clearCanvas();

        composer.clearBuffer(true, true, true);

        if (displays.size > 0) {
            displays.forEach(function(display) {
                if (display.options.enabled) {
                    if (display.renderToCanvas) {
                        display.renderToCanvas(this, data);
                    }
                    else if (display.updateScene) {
                        display.updateScene(this, data);
                    }
                }
            }, this);

            composer.render();
        }

        return composer.readBuffer;
    },

    toString: function() {
        return this.name + '' + this.id;
    },

    toJSON: function() {
        var displays = this.displays.nodes.map(function(display) {
            return display.toJSON();
        });

        return {
            name: this.name,
            options: this.options,
            displays: displays
        };
    }
});

module.exports = Scene;