'use strict';

const _ = require('lodash');
const THREE = require('three');
const NodeCollection = require('../core/NodeCollection.js');
const Display = require('../display/Display.js');
const Effect = require('../effects/Effect.js');
const Composer = require('../graphics/Composer.js');
const TexturePass = require('../graphics/TexturePass.js');
const Global = require('../core/Global.js');

const defaults = {
    blendMode: 'Normal',
    opacity: 1.0,
    lightIntensity: 1.0,
    lightDistance: 500,
    cameraZoom: 250
};

const FOV = 45;
const NEAR = 1;
const FAR = 10000;
const CAMERA_POS_Z = 250;

var Scene = function(name, options) {
    Display.call(this, 'Scene', defaults);

    this.owner = null;
    this.displays = new NodeCollection();
    this.effects = new NodeCollection();

    this.update(options);
};

Scene.prototype = _.create(Display.prototype, {
    constructor: Scene,

    update: function(options) {
        var changed = Display.prototype.update.call(this, options);

        if (changed) {
            if (this.owner) {
                this.updatePasses();
            }

            if (this.lights && (options.lightDistance !== undefined || options.lightIntensity !== undefined)) {
                this.updateLights();
            }

            if (this.camera && options.cameraZoom !== undefined) {
                this.camera.position.z = options.cameraZoom;
            }
        }

        return changed;
    },

    addToStage: function(stage) {
        var size = stage.getSize();

        this.composer = new Composer(stage.renderer);
        this.graph = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(FOV, size.width/size.height, NEAR, FAR);
        this.camera.position.set(0, 0, CAMERA_POS_Z);

        this.lights = [
            new THREE.PointLight(0xffffff, 1, 0),
            new THREE.PointLight(0xffffff, 1, 0),
            new THREE.PointLight(0xffffff, 1, 0)
        ];

        this.graph.add(this.camera);
        this.graph.add(this.lights[0]);
        this.graph.add(this.lights[1]);
        this.graph.add(this.lights[2]);

        //this.graph.fog = new THREE.Fog(0x000000, NEAR, FAR);

        this.updatePasses();
        this.updateLights();
    },

    removeFromStage: function() {
        this.owner = null;
        this.displays.clear();
        this.displays = null;
        this.effects.clear();
        this.effects = null;
        this.composer.dispose();
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

        obj.owner = this;

        if (obj.addToScene) {
            obj.addToScene(this);
        }

        this.updatePasses();
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

        obj.owner = null;

        if (obj.removeFromScene) {
            obj.removeFromScene(this);
        }

        this.updatePasses();
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
            this.updatePasses();
        }
    },

    updatePasses: function() {
        var composer = this.composer;

        composer.clearPasses();
        composer.addPass(Global.frameBuffers['2D'].pass);
        composer.addPass(Global.frameBuffers['3D'].pass);

        this.displays.nodes.forEach(function(display) {
            if (display.pass) {
                composer.addPass(display.pass);
            }
        });

        this.effects.nodes.forEach(function(effect) {
            if (effect.pass) {
                composer.addPass(effect.pass);
            }
        });
    },

    updateLights: function() {
        var lights = this.lights,
            intensity = this.options.lightIntensity,
            distance = this.options.lightDistance;

        lights[0].intensity = intensity;
        lights[1].intensity = intensity;
        lights[2].intensity = intensity;

        lights[0].position.set(0, distance * 2, 0);
        lights[1].position.set(distance, distance * 2, distance);
        lights[2].position.set(-distance, -distance * 2, -distance);
    },

    render: function(data) {
        var displays = this.displays.nodes,
            effects = this.effects.nodes,
            composer = this.composer,
            buffer2D = Global.frameBuffers['2D'],
            buffer3D = Global.frameBuffers['3D'],
            hasGeometry = false;

        buffer3D.clear();
        buffer2D.clear();

        composer.clearBuffer(true, true, true);

        if (displays.size > 0 || effects.size > 0) {
            displays.forEach(function(display) {
                if (display.options.enabled) {
                    if (display.renderToCanvas) {
                        display.renderToCanvas(buffer2D.context, data);
                    }
                    else if (display.updateScene) {
                        display.updateScene(buffer3D.renderer, data);
                        hasGeometry = true;
                    }
                }
            }, this);

            if (hasGeometry) {
                buffer3D.renderer.render(this.graph, this.camera);
            }

            effects.forEach(function(effect) {
                if (effect.options.enabled) {
                    if (effect.renderToCanvas) {
                        effect.renderToCanvas(buffer2D.context, data);
                    }
                    else if (effect.updateScene) {
                        effect.updateScene(buffer3D.renderer, data);
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

        var effects = this.effects.nodes.map(function(effect) {
            return effect.toJSON();
        });

        return {
            name: this.name,
            options: this.options,
            displays: displays,
            effects: effects
        };
    }
});

module.exports = Scene;