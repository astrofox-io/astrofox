'use strict';

const THREE = require('three');

const Scene = require('./Scene');
const Display = require('../displays/Display');
const DisplayLibrary = require('../lib/DisplayLibrary');
const EffectsLibrary = require('../lib/EffectsLibrary');
const NodeCollection = require('../core/NodeCollection');
const Composer = require('../graphics/Composer');
const FrameBuffer = require('../graphics/FrameBuffer');
const { logger, raiseError } = require('../core/Global');

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

        this.changed = true;

        return scene;
    }

    removeScene(scene) {
        this.scenes.removeNode(scene);

        scene.owner = null;

        scene.removeFromStage(this);

        this.changed = true;
    }

    shiftScene(scene, i) {
        let index = this.scenes.indexOf(scene);

        this.scenes.swapNodes(index, index + i);

        this.changed = true;
    }

    getScenes() {
        return this.scenes.nodes;
    }

    clearScenes() {
        this.getScenes().forEach(scene => {
            this.removeScene(scene);
        });

        this.changed = true;
    }

    hasScenes() {
        return this.getScenes().size > 0;
    }

    hasChanges() {
        if (this.changed) {
            return true;
        }

        let changes = false;

        this.getScenes().forEach(scene => {
            if (!changes && scene.hasChanges()) {
                changes = true;
            }
        });

        return changes;
    }

    resetChanges() {
        this.changed = false;

        this.getScenes().forEach(scene => {
            scene.resetChanges();
        });
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
        this.getScenes().forEach(scene => {
            scene.setSize(width, height);
        });

        this.composer.setSize(width, height);

        this.buffer2D.setSize(width, height);
        this.buffer3D.setSize(width, height);
    }

    loadConfig(config) {
        let component;

        if (typeof config === 'object') {
            this.clearScenes();

            if (config.scenes) {
                config.scenes.forEach(scene => {
                    let newScene = new Scene(scene.options);

                    this.addScene(newScene);

                    if (scene.displays) {
                        scene.displays.forEach(display => {
                            component = DisplayLibrary[display.name];

                            if (!component) component = DisplayLibrary[display.name + 'Display'];

                            if (component) {
                                newScene.addElement(new component(display.options));
                            }
                            else {
                                logger.warn('Display "%s" not found.', display.name);
                            }
                        });
                    }

                    if (scene.effects) {
                        scene.effects.forEach(effect => {
                            component = EffectsLibrary[effect.name];

                            if (!component) component = EffectsLibrary[effect.name + 'Effect'];

                            if (component) {
                                newScene.addElement(new component(effect.options));
                            }
                            else {
                                logger.warn('Effect "%s" not found.', effect.name);
                            }
                        });
                    }
                });
            }

            if (config.stage) {
                this.update(config.stage.options);
            }
            else {
                this.update(Stage.defaults);
            }
        }
        else {
            raiseError('Invalid project data.');
        }
    }

    render(data, callback) {
        let options, buffer,
            composer = this.composer;

        composer.clear(this.backgroundColor, 1);

        this.getScenes().forEach(scene => {
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
