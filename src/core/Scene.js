import Display from 'core/Display';
import Effect from 'core/Effect';
import EntityList from 'core/EntityList';
import Composer from 'graphics/Composer';
import { renderImageToCanvas } from '../utils/canvas';

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
  static config = {
    name: 'Scene',
    description: 'Scene display.',
    type: 'display',
    label: 'Scene',

    defaultProperties: {
      blendMode: 'Normal',
      opacity: 1.0,
      mask: false,
      inverse: false,
      stencil: false,
    },
    controls: {
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
    },
  };

  constructor(properties) {
    super(Scene, properties);

    this.stage = null;
    this.displays = new EntityList();
    this.effects = new EntityList();

    this.renderToCanvas = this.renderToCanvas.bind(this);
    this.renderToScene = this.renderToScene.bind(this);
    this.getSize = this.getSize.bind(this);
  }

  addToStage(stage) {
    this.composer = new Composer(stage.renderer);
  }

  removeFromStage() {
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

    const { renderToScene, renderToCanvas, getSize } = this;
    const scene = { renderToScene, renderToCanvas, getSize };

    const target = this.getTarget(obj);

    target.addElement(obj, index);

    obj.scene = this;

    if (obj.addToScene) {
      obj.addToScene(scene);
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

    obj.scene = null;

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

    return target.shiftElement(obj, spaces);
  }

  renderToCanvas(image, props, origin) {
    renderImageToCanvas(this.stage.canvasBuffer.getContext(), image, props, origin);
  }

  renderToScene(scene, camera) {
    this.stage.webglBuffer.render(scene, camera);
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
      renderToScene,
      renderToCanvas,
      getSize,
    } = this;

    this.clear();
    this.updateReactors(data);

    const scene = { renderToScene, renderToCanvas, getSize };
    const passes = [webglBuffer.pass, canvasBuffer.pass];

    if (displays.length > 0 || effects.length > 0) {
      displays.forEach(display => {
        if (display.enabled) {
          display.updateReactors(data);
          display.render(scene, data);

          if (display.pass) {
            passes.push(display.pass);
          }
        }
      });

      effects.forEach(effect => {
        if (effect.enabled) {
          effect.updateReactors(data);
          effect.render(scene, data);

          if (effect.pass) {
            passes.push(effect.pass);
          }
        }
      });

      composer.render(passes);
    }

    return composer.inputBuffer;
  }
}
