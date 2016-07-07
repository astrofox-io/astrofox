'use strict';

const THREE = require('three');

const Scene = require('./Scene.js');
const IO = require('../core/IO.js');
const EventEmitter = require('../core/EventEmitter.js');
const NodeCollection = require('../core/NodeCollection.js');
const Composer = require('../graphics/Composer.js');

class Stage {
    constructor() {
        this.scenes = new NodeCollection();
    
        this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
        this.renderer.setSize(854, 480);
        this.renderer.autoClear = false;
    
        this.composer = new Composer(this.renderer);
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
        let buffer = new IO.Buffer(base64, 'base64');

        if (callback) callback(buffer);
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
                options = _.assign({}, scene.options);

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
