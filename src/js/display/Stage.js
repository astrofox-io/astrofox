'use strict';

const THREE = require('three');

const Display = require('./Display.js');
const Scene = require('./Scene.js');
const NodeCollection = require('../core/NodeCollection.js');
const Composer = require('../graphics/Composer.js');
const FrameBuffer = require('../graphics/FrameBuffer.js');
const { Events } = require('../core/Global.js');

class Stage extends Display {
    constructor() {
        super('Stage', Stage.defaults);

        this.scenes = new NodeCollection();
    
        this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
        this.renderer.setSize(Stage.defaults.width, Stage.defaults.height);
        this.renderer.autoClear = false;
    
        this.composer = new Composer(this.renderer);

        this.buffer2D = new FrameBuffer('2d', Stage.defaults);
        this.buffer3D = new FrameBuffer('webgl', Stage.defaults);

        this.backgroundColor = new THREE.Color(Stage.defaults.backgroundColor);
    }

    update(options) {
        let changed = super.update(options);

        if (options.width !== undefined || options.height !== undefined) {
            this.setSize(this.options.width, this.options.height);
        }

        if (options.backgroundColor !== undefined) {
            this.backgroundColor.set(options.backgroundColor);
        }

        return changed;
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
        let canvas = this.renderer.domElement;

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

    setSize(width, height) {
        this.scenes.nodes.forEach(scene => {
            scene.setSize(width, height);
        });

        this.composer.setSize(width, height);

        this.buffer2D.setSize(width, height);
        this.buffer3D.setSize(width, height);
    }

    toJSON() {
        return {
            options: this.options
        };
    }

    renderFrame(data, callback) {
        let options, buffer,
            composer = this.composer;

        composer.clear(this.backgroundColor, 1);

        this.scenes.nodes.forEach(scene => {
            if (scene.options.enabled) {
                buffer = scene.render(data);
                options = Object.assign({}, scene.options);

                composer.blendBuffer(buffer, options);
            }
        }, this);

        composer.renderToScreen();

        if (callback) callback();
    }
}

Stage.label = 'Stage';

Stage.defaults = {
    aspectRatio: '16:9',
    width: 854,
    height: 480,
    backgroundColor: '#000000'
};

module.exports = Stage;
