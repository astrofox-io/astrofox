import { WebGLRenderer, Color } from 'three';
import cloneDeep from 'lodash/cloneDeep';
import Scene from 'core/Scene';
import Entity from 'core/Entity';
import { resetDisplayCount } from 'core/Display';
import { Composer, CanvasBuffer, WebglBuffer } from 'graphics';
import * as displayLibrary from 'displays';
import * as effectsLibrary from 'effects';
import { logger, events } from 'view/global';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DISPLAY_TYPE_STAGE,
  DEFAULT_BACKGROUND_COLOR,
} from 'view/constants';
import { isDefined, insert, remove, swap } from 'utils/array';

export default class Stage extends Entity {
  static label = 'Stage';

  static className = 'Stage';

  static defaultProperties = {
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    zoom: 100,
  };

  constructor(properties) {
    super({ ...Stage.defaultProperties, ...properties });

    this.scenes = [];
    this.initialized = false;

    Object.defineProperty(this, 'type', { value: DISPLAY_TYPE_STAGE });
  }

  init(canvas) {
    if (this.initialized) {
      return;
    }

    const { width, height, backgroundColor } = this.properties;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      premultipliedAlpha: true,
      alpha: false,
    });

    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;

    this.composer = new Composer(this.renderer);

    this.canvasBuffer = new CanvasBuffer(width, height);
    this.webglBuffer = new WebglBuffer(width, height);

    this.backgroundColor = new Color(backgroundColor);

    this.initialized = true;
  }

  update(properties) {
    const { width, height, backgroundColor } = properties;
    const changed = super.update(properties);

    if (changed) {
      if (isDefined(width, height)) {
        this.setSize(width, height);
      }

      if (backgroundColor !== undefined) {
        this.backgroundColor.set(backgroundColor);
      }
    }

    return changed;
  }

  getSceneById(id) {
    return this.scenes.find(e => e.id === id);
  }

  getSceneElementById(id) {
    return this.scenes.reduce((element, scene) => {
      if (!element) {
        element = scene.getElementById(id);
      }
      return element;
    }, undefined);
  }

  removeSceneElement(obj) {
    if (obj instanceof Scene) {
      this.removeScene(obj);
    } else {
      const scene = this.getSceneById(obj.scene.id);
      if (scene) {
        scene.removeElement(obj);
      }
    }
  }

  getImage(format) {
    return this.composer.getImage(format);
  }

  getSize() {
    if (this.composer) {
      return this.composer.getSize();
    }

    return { width: 0, height: 0 };
  }

  setSize(width, height) {
    this.scenes.forEach(scene => {
      scene.setSize(width, height);
    });

    this.composer.setSize(width, height);

    this.canvasBuffer.setSize(width, height);
    this.webglBuffer.setSize(width, height);

    events.emit('stage-resize');
  }

  addScene(scene = new Scene(), index) {
    if (index !== undefined) {
      insert(this.scenes, index, scene);
    } else {
      this.scenes.push(scene);
    }

    scene.stage = this;

    if (scene.addToStage) {
      scene.addToStage(this);
    }

    this.changed = true;

    return scene;
  }

  removeScene(scene) {
    remove(this.scenes, scene);

    scene.stage = null;

    scene.removeFromStage(this);

    this.changed = true;
  }

  shiftScene(scene, i) {
    const index = this.scenes.indexOf(scene);

    swap(this.scenes, index, index + i);

    this.changed = this.scenes.indexOf(scene) !== index;

    return this.changed;
  }

  clearScenes() {
    [...this.scenes].forEach(scene => this.removeScene(scene));

    resetDisplayCount();

    this.changed = true;
  }

  getSceneData() {
    return this.scenes.map(scene => scene.toJSON());
  }

  hasScenes() {
    return this.scenes.length > 0;
  }

  hasChanges() {
    if (this.changed) {
      return true;
    }

    return !!this.scenes.find(scene => scene.hasChanges());
  }

  resetChanges() {
    this.changed = false;

    this.scenes.forEach(scene => {
      scene.resetChanges();
    });
  }

  loadConfig(config) {
    if (typeof config === 'object') {
      this.clearScenes();

      if (config.scenes) {
        config.scenes.forEach(scene => {
          const newScene = new Scene(scene.properties);

          this.addScene(newScene);

          const loadReactors = (reactors, element) => {
            Object.keys(reactors).forEach(key => {
              element.setReactor(key, reactors[key]);
            });
          };

          const loadComponent = (lib, { name, properties, reactors }) => {
            const Component = lib[name];

            if (Component) {
              const element = newScene.addElement(new Component(properties));
              if (reactors) {
                loadReactors(reactors, element);
              }
            } else {
              logger.warn('Component not found:', name);
            }
          };

          if (scene.displays) {
            scene.displays.forEach(display => loadComponent(displayLibrary, display));
          }

          if (scene.effects) {
            scene.effects.forEach(effect => loadComponent(effectsLibrary, effect));
          }

          if (scene.reactors) {
            loadReactors(scene.reactors, newScene);
          }
        });
      }

      if (config.stage) {
        this.update(config.stage.properties);
      } else {
        this.update(Stage.defaultProperties);
      }
    }
  }

  toJSON() {
    const { id, name, type, properties } = this;

    return {
      id,
      name,
      type,
      properties: cloneDeep(properties),
    };
  }

  renderScene(scene, data) {
    const buffer = scene.render(data);

    this.composer.blendBuffer(buffer, { ...scene.properties });
  }

  render(data) {
    const { composer, scenes } = this;

    composer.clear(this.backgroundColor, 1);

    scenes.forEach(scene => {
      if (scene.properties.enabled) {
        this.renderScene(scene, data);
      }
    });

    composer.renderToScreen();
  }
}
