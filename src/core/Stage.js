import { Color } from 'three';
import cloneDeep from 'lodash/cloneDeep';
import Scene from 'core/Scene';
import Entity from 'core/Entity';
import EntityList from 'core/EntityList';
import Composer from 'graphics/Composer';
import CanvasBuffer from 'graphics/CanvasBuffer';
import WebglBuffer from 'graphics/WebglBuffer';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_BGCOLOR,
} from 'view/constants';
import { isDefined } from 'utils/array';
import { getRenderer } from 'graphics/common';

export default class Stage extends Entity {
  static config = {
    name: 'Stage',
    description: 'The stage.',
    type: 'stage',
    defaultProperties: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      backgroundColor: DEFAULT_CANVAS_BGCOLOR,
      zoom: 100,
    },
  };

  constructor(properties) {
    const { name, defaultProperties } = Stage.config;

    super(name, { ...defaultProperties, ...properties });

    this.scenes = new EntityList();
  }

  init(canvas) {
    const { width, height, backgroundColor } = this.properties;

    this.renderer = getRenderer(canvas);
    this.renderer.setSize(width, height);

    this.composer = new Composer(this.renderer);

    this.canvasBuffer = new CanvasBuffer(width, height);
    this.webglBuffer = new WebglBuffer(this.renderer);

    this.backgroundColor = new Color(backgroundColor);
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
    }

    const scene = this.getSceneById(obj.scene.id);

    if (scene) {
      return scene.shiftElement(obj, spaces);
    }

    return false;
  }

  addScene(scene = new Scene(), index) {
    this.scenes.addElement(scene, index);

    scene.stage = this;

    if (scene.addToStage) {
      scene.addToStage(this);
    }

    return scene;
  }

  removeScene(scene) {
    this.scenes.removeElement(scene);

    scene.stage = null;

    scene.removeFromStage(this);
  }

  clearScenes() {
    [...this.scenes].forEach(scene => this.removeScene(scene));
  }

  hasScenes() {
    return !this.scenes.isEmpty();
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
    const { composer } = this;

    const buffer = scene.render(data);

    composer.blendBuffer(buffer, scene.properties);
  }

  render(data) {
    const { composer, scenes, backgroundColor } = this;

    composer.clear(backgroundColor, 1);

    scenes.forEach(scene => {
      if (scene.enabled) {
        this.renderScene(scene, data);
      }
    });

    composer.renderToScreen();
  }
}
