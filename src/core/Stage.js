import { WebGLRenderer, Color } from 'three';
import cloneDeep from 'lodash/cloneDeep';
import Scene from 'core/Scene';
import Entity from 'core/Entity';
import EntityList from 'core/EntityList';
import { resetDisplayCount } from 'core/Display';
import { Composer, CanvasBuffer, WebglBuffer } from 'graphics';
import * as displayLibrary from 'displays';
import * as effectsLibrary from 'effects';
import { logger, events } from 'view/global';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_BACKGROUND_COLOR,
} from 'view/constants';
import { isDefined } from 'utils/array';

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

    this.scenes = new EntityList();
    this.initialized = false;
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

  getSceneById(id) {
    return this.scenes.getElementById(id);
  }

  getStageElementById(id) {
    return this.scenes.reduce((element, scene) => {
      if (!element) {
        element = scene.getElementById(id);
      }
      return element;
    }, this.getSceneById(id));
  }

  removeStageElement(obj) {
    if (obj instanceof Scene) {
      this.removeScene(obj);
    } else {
      const scene = this.getSceneById(obj.scene.id);
      if (scene) {
        scene.removeElement(obj);
      }
    }
  }

  shiftStageElement(obj, spaces) {
    if (obj instanceof Scene) {
      return this.scenes.shiftElement(obj, spaces);
    } else {
      const scene = this.getSceneById(obj.scene.id);
      if (scene) {
        scene.shiftElement(obj, spaces);
      }
    }
  }

  addScene(scene = new Scene(), index) {
    this.scenes.addElement(scene, index);

    Object.defineProperty(scene, 'stage', { value: this, configurable: true });

    if (scene.addToStage) {
      scene.addToStage(this);
    }

    return scene;
  }

  removeScene(scene) {
    this.scenes.removeElement(scene);

    delete scene.stage;

    scene.removeFromStage(this);
  }

  clearScenes() {
    [...this.scenes].forEach(scene => this.removeScene(scene));

    resetDisplayCount();
  }

  hasScenes() {
    return !this.scenes.isEmpty();
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
    const { composer, scenes, backgroundColor } = this;

    composer.clear(backgroundColor, 1);

    scenes.forEach(scene => {
      if (scene.properties.enabled) {
        this.renderScene(scene, data);
      }
    });

    composer.renderToScreen();
  }
}
