'use strict';

const THREE = require('three');

const Display = require('./Display.js');
const Scene = require('./Scene.js');
const NodeCollection = require('../core/NodeCollection.js');
const Composer = require('../graphics/Composer.js');
const { Events, FrameBuffers } = require('../core/Global.js');

const defaults = {
    width: 854,
    height: 480
};

const canvasSizes = {
    '16:9': { width: 854, height: 480 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 480, height: 480 }
};

class Stage extends Display {
    constructor() {
        super('Stage', defaults);

        this.scenes = new NodeCollection();
    
        this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
        this.renderer.setSize(defaults.width, defaults.height);
        this.renderer.autoClear = false;
    
        this.composer = new Composer(this.renderer);

        Events.on('canvas_size_update', this.updateCanvasSize, this);
    }

    addScene(scene) {
        if (typeof scene === 'undefined') {
            scene = new Scene();
        }

        this.scenes.addNode(scene);

        scene.owner = this;

        scene.addToStage(this);

        return scene;
    }

    removeScene(scene) {
        this.scenes.removeNode(scene);

        scene.owner = null;

        scene.removeFromStage(this);
    }

    shiftScene(scene, i) {
        let index = this.scenes.indexOf(scene);

        this.scenes.swapNodes(index, index + i);
    }

    getScenes() {
        return this.scenes.nodes;
    }

    clearScenes() {
        this.scenes.nodes.forEach(scene => {
            this.removeScene(scene);
        });
    }

    hasScenes() {
        return this.scenes.nodes.size > 0;
    }

    getSize() {
        let canvas =  this.renderer.domElement;

        return {
            width: canvas.width,
            height: canvas.height
        };
    }

    getImage(callback, format) {
        let img = this.renderer.domElement.toDataURL(format || 'image/png');
        let base64 = img.replace(/^data:image\/\w+;base64,/, '');
        let buffer = new Buffer(base64, 'base64');

        if (callback) callback(buffer);
    }

    updateCanvasSize(size) {
        let { width, height } = canvasSizes[size];

        this.renderer.setSize(width, height);

        this.scenes.nodes.forEach(scene => {
            scene.setSize(width, height);
        });

        FrameBuffers['2D'].setSize(width, height);
        FrameBuffers['3D'].setSize(width, height);
    }

    toJSON() {
        let scenes = this.scenes.map(scene => {
            return scene.toJSON();
        });

        return {
            scenes: scenes,
            options: this.options
        };
    }

    renderFrame(data, callback) {
        let options, buffer,
            composer = this.composer;

        composer.clearScreen(true, true, true);
        composer.clearBuffer(true, true, true);

        this.scenes.nodes.forEach((scene, index) => {
            if (scene.options.enabled) {
                buffer = scene.render(data);
                options = Object.assign({}, scene.options);

                if (index === 0) {
                    options.blendMode = 'None';
                }

                composer.blendBuffer(buffer, options);
            }
        }, this);

        composer.renderToScreen();

        if (callback) callback();
    }
}

module.exports = Stage;
