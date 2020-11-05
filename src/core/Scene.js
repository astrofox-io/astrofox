import Display from 'core/Display';
import Effect from 'core/Effect';
import EntityList from 'core/EntityList';
import Composer from 'graphics/Composer';

const blendOptions = [
  'None',
  'Normal',
  null,
  'Darken',
  'Multiply',
  'Color Burn',
  'Linear Burn',
  null,
  'Lighten',
  'Screen',
  'Color Dodge',
  'Linear Dodge',
  null,
  'Overlay',
  'Soft Light',
  'Hard Light',
  'Vivid Light',
  'Linear Light',
  'Pin Light',
  'Hard Mix',
  null,
  'Difference',
  'Exclusion',
  'Subtract',
  'Divide',
  null,
  'Negation',
  'Phoenix',
  'Glow',
  'Reflect',
];

export default class Scene extends Display {
  static info = {
    name: 'Scene',
    description: 'Scene display.',
    type: 'display',
    label: 'Scene',
  };

  static defaultProperties = {
    blendMode: 'Normal',
    opacity: 1.0,
    mask: false,
    inverse: false,
    stencil: false,
  };

  static controls = {
    blendMode: {
      label: 'Blending',
      type: 'select',
      items: blendOptions,
    },
    opacity: {
      label: 'Opacity',
      type: 'number',
      min: 0,
      max: 1.0,
      step: 0.01,
      withRange: true,
      withReactor: true,
    },
    mask: {
      label: 'Mask',
      type: 'toggle',
    },
    inverse: {
      label: 'Inverse',
      type: 'toggle',
      hidden: display => !display.properties.mask,
    },
  };

  constructor(properties) {
    super(Scene, { ...Scene.defaultProperties, ...properties });

    this.displays = new EntityList();
    this.effects = new EntityList();
  }

  addToStage(stage) {
    Object.defineProperty(this, 'stage', { value: stage, configurable: true });

    this.composer = new Composer(stage.renderer);
  }

  removeFromStage() {
    delete this.stage;

    this.displays.clear();
    this.effects.clear();
    this.composer.dispose();
  }

  getSize() {
    return this.composer.getSize();
  }

  setSize(width, height) {
    this.displays.forEach(display => {
      if (display.setSize) {
        display.setSize(width, height);
      }
    });

    this.effects.forEach(effect => {
      if (effect.setSize) {
        effect.setSize(width, height);
      }
    });

    this.composer.setSize(width, height);
  }

  getTarget(obj) {
    return obj instanceof Effect ? this.effects : this.displays;
  }

  getElementById(id) {
    return this.displays.getElementById(id) || this.effects.getElementById(id);
  }

  hasElement(obj) {
    return !!this.getElementById(obj.id);
  }

  addElement(obj, index) {
    if (!obj) {
      return;
    }

    const target = this.getTarget(obj);

    target.addElement(obj, index);

    Object.defineProperty(obj, 'scene', { value: this });

    if (obj.addToScene) {
      obj.addToScene(this);
    }

    if (obj.setSize) {
      const { width, height } = this.stage.getSize();

      obj.setSize(width, height);
    }

    return obj;
  }

  removeElement(obj) {
    if (!this.hasElement(obj)) {
      return false;
    }

    const target = this.getTarget(obj);

    target.removeElement(obj);

    delete obj.scene;

    if (obj.removeFromScene) {
      obj.removeFromScene(this);
    }

    return true;
  }

  shiftElement(obj, spaces) {
    if (!this.hasElement(obj)) {
      return false;
    }

    const target = this.getTarget(obj);

    const changed = target.shiftElement(obj, spaces);

    return changed;
  }

  getCanvasConext() {
    return this.stage.canvasBuffer.context;
  }

  getRenderer() {
    return this.stage.webglBuffer.renderer;
  }

  toJSON() {
    const json = super.toJSON();
    const { displays, effects } = this;

    return {
      ...json,
      displays: displays.map(display => display.toJSON()),
      effects: effects.map(effect => effect.toJSON()),
    };
  }

  clear() {
    const {
      composer,
      stage: { canvasBuffer, webglBuffer },
    } = this;

    canvasBuffer.clear();
    webglBuffer.clear();
    composer.clearBuffer();
  }

  render(data) {
    const {
      composer,
      displays,
      effects,
      stage: { canvasBuffer, webglBuffer },
    } = this;

    this.clear();
    this.updateReactors(data);
    const passes = [canvasBuffer.pass, webglBuffer.pass];

    if (displays.length > 0 || effects.length > 0) {
      displays.forEach(display => {
        if (display.enabled) {
          display.updateReactors(data);
          display.render(this, data);

          if (display.pass) {
            passes.push(display.pass);
          }
        }
      });

      effects.forEach(effect => {
        if (effect.enabled) {
          effect.updateReactors(data);
          effect.render(this, data);

          if (effect.pass) {
            passes.push(effect.pass);
          }
        }
      });

      composer.render(passes);
    }

    return composer.readBuffer;
  }
}
