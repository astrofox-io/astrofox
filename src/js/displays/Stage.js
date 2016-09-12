'use strict';

const THREE = require('three');

const Display = require('./Display');
const Scene = require('./Scene');
const NodeCollection = require('../core/NodeCollection');
const Composer = require('../graphics/Composer');
const FrameBuffer = require('../graphics/FrameBuffer');
const { Events } = require('../core/Global');

class Stage extends Display {
    constructor(options) {
        super(Stage, options);

        this.scenes = new NodeCollection();
    
        this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.autoClear = false;
    
        this.composer = new Composer(this.renderer);

        this.buffer2D = new FrameBuffer('2d', this.options);
        this.buffer3D = new FrameBuffer('webgl', this.options);

        this.backgroundColor = new THREE.Color(this.options.backgroundColor);
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            if (options.width !== undefined || options.height !== undefined) {
                this.setSize(this.options.width, this.options.height);
            }

            if (options.backgroundColor !== undefined) {
                this.backgroundColor.set(options.backgroundColor);
            }
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

    render(data, callback) {
        let options, buffer,
            composer = this.composer;

        composer.clear(this.backgroundColor, 1);

        this.scenes.nodes.forEach(scene => {
            if (scene.options.enabled) {
                buffer = scene.render(data);
                options = Object.assign({}, scene.options);

                composer.blendBuffer(buffer, options);
            }
        });

        composer.renderToScreen();

        if (callback) callback();
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options
        };
    }
}

Stage.label = 'Stage';

Stage.className = 'Stage';

Stage.defaults = {
    aspectRatio: '16:9',
    width: 854,
    height: 480,
    backgroundColor: '#000000'
};

module.exports = Stage;
