import * as THREE from 'three';

import Scene from './Scene';
import Display from '../displays/Display';
import WatermarkDisplay from '../displays/WatermarkDisplay';
import NodeCollection from '../core/NodeCollection';
import Composer from '../graphics/Composer';
import { CanvasBuffer, GLBuffer } from '../graphics/FrameBuffer';
import { logger, raiseError, events } from '../core/Global';
import * as displayLibrary from '../lib/displays';
import * as effectsLibrary from '../lib/effects';

export default class Stage extends Display {
    constructor(app, options) {
        super(Stage, options);

        this.app = app;
        this.scenes = new NodeCollection();
    }

    init(canvas) {
        let { width, height, backgroundColor } = this.options;

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            premultipliedAlpha: true,
            alpha: false
        });

        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        this.composer = new Composer(this.renderer);

        this.buffer2D = new CanvasBuffer(width, height);
        this.buffer3D = new GLBuffer(width, height);

        this.backgroundColor = new THREE.Color(backgroundColor);

        this.watermarkDisplay = new WatermarkDisplay();
        this.watermarkDisplay.setSize(width, height);

        this.watermarkScene = new Scene();
        this.watermarkScene.addToStage(this);
        this.watermarkScene.addElement(this.watermarkDisplay);
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

        this.changed = this.scenes.swapNodes(index, index + i);

        return this.changed;
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

    getSortedDisplays() {
        let displays = [];

        this.getScenes().reverse().forEach(scene => {
            displays.push(scene);

            scene.getEffects().reverse().forEach(effect => {
                displays.push(effect);
            });

            scene.getDisplays().reverse().forEach(display => {
                displays.push(display);
            });
        });

        return displays;
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

    getImage(callback, format) {
        let img = this.renderer.domElement.toDataURL(format || 'image/png');
        let base64 = img.replace(/^data:image\/\w+;base64,/, '');
        let buffer = new Buffer(base64, 'base64');

        if (callback) callback(buffer);
    }

    getSize() {
        return this.composer.getSize();
    }

    setSize(width, height) {
        this.getScenes().forEach(scene => {
            scene.setSize(width, height);
        });

        this.composer.setSize(width, height);

        this.buffer2D.setSize(width, height);
        this.buffer3D.setSize(width, height);

        if (this.watermarkScene.options.enabled) {
            this.watermarkScene.setSize(width, height);
        }

        events.emit('stage-resize');
    }

    setZoom(val) {
        let zoom = this.options.zoom;

        if (val > 0) {
            if (zoom < 1.0) {
                this.update({ zoom: zoom + 0.25 });
            }
        }
        else if (val < 0) {
            if (zoom > 0.25) {
                this.update({ zoom: zoom - 0.25 });
            }
        }
        else {
            this.update({ zoom: 1.0 });
        }

        events.emit('zoom');
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
                            component = displayLibrary[display.name];

                            if (!component) component = displayLibrary[display.name + 'Display'];

                            if (component) {
                                newScene.addElement(new component(display.options));
                            }
                            else {
                                logger.warn('Display not found:', display.name);
                            }
                        });
                    }

                    if (scene.effects) {
                        scene.effects.forEach(effect => {
                            component = effectsLibrary[effect.name];

                            if (!component) component = effectsLibrary[effect.name + 'Effect'];

                            if (component) {
                                newScene.addElement(new component(effect.options));
                            }
                            else {
                                logger.warn('Effect not found:', effect.name);
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
        let composer = this.composer;

        composer.clear(this.backgroundColor, 1);

        this.getScenes().forEach(scene => {
            if (scene.options.enabled) {
                this.renderScene(scene, data);
            }
        });

        // Show watermark
        if (this.watermarkScene.options.enabled) {
            this.renderScene(this.watermarkScene, data);
        }

        composer.renderToScreen();

        if (callback) callback();
    }

    renderScene(scene, data) {
        let options, buffer,
            composer = this.composer;

        buffer = scene.render(data);
        options = Object.assign({}, scene.options);
        composer.blendBuffer(buffer, options);
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
    width: 854,
    height: 480,
    zoom: 1.0,
    backgroundColor: '#000000'
};