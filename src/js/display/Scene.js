'use strict';

var _ = require('lodash');
var THREE = require('three');
var NodeCollection = require('../core/NodeCollection.js');
var Display = require('../display/Display.js');
var CanvasDisplay = require('../display/CanvasDisplay.js');
var Effect = require('../effects/Effect.js');
var Composer = require('../graphics/Composer.js');

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
    Display.call(this, 'Scene', defaults);

    this.parent = null;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.displays = new NodeCollection();
    this.effects = new NodeCollection();

    this.update(options);
};

Scene.prototype = _.create(Display.prototype, {
    constructor: Scene,

    update: function(options) {
        var changed = Display.prototype.update.call(this, options);

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

    addElement: function(obj) {
        var nodes;

        if (obj instanceof Effect) {
            nodes = this.effects;
        }
        else if (obj instanceof Display) {
            nodes = this.displays;
        }

        nodes.addNode(obj);

        obj.parent = this;

        if (obj.addToScene) {
            obj.addToScene(this);
        }

        this.checkDisplays();
    },

    removeElement: function(obj) {
        var nodes;

        if (obj instanceof Effect) {
            nodes = this.effects;
        }
        else if (obj instanceof Display) {
            nodes = this.displays;
        }

        nodes.removeNode(obj);

        obj.parent = null;

        if (obj.removeFromScene) {
            obj.removeFromScene(this);
        }

        this.checkDisplays();
    },

    shiftElement: function(obj, i) {
        var nodes, index;

        if (obj instanceof Effect) {
            nodes = this.effects;
        }
        else if (obj instanceof Display) {
            nodes = this.displays;
        }

        index = nodes.indexOf(obj);

        if (nodes.swapNodes(index, index + i)) {
            this.composer.shiftPass(obj.pass, i);
        }
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

    render: function(data, buffer) {
        var displays = this.displays.nodes,
            effects = this.effects.nodes,
            options = this.options,
            composer = this.composer;

        this.clearCanvas();

        composer.clearBuffer(true, true, true);

        if (buffer) composer.readBuffer = buffer.clone();

        if (displays.size > 0 || effects.size > 0) {
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

            effects.forEach(function(effect) {
                if (effect.options.enabled) {
                    if (effect.renderToCanvas) {
                        effect.renderToCanvas(this, data);
                    }
                    else if (effect.updateScene) {
                        effect.updateScene(this, data);
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