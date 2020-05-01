import Display from 'core/Display';
import Effect from 'core/Effect';
import EntityList from 'core/EntityList';
import Composer from 'graphics/Composer';

export default class Scene extends Display {
  static label = 'Scene';

  static className = 'Scene';

  static defaultProperties = {
    blendMode: 'Normal',
    opacity: 1.0,
    mask: false,
    inverse: false,
    stencil: false,
  };

  constructor(properties) {
    super(Scene, properties);

    this.stage = null;
    this.displays = new EntityList();
    this.effects = new EntityList();
    this.reactors = {};

    Object.defineProperty(this, 'type', { value: 'scene' });
  }

  update(properties) {
    const changed = super.update(properties);
    const { stage } = this;

    if (changed && stage) {
      this.updatePasses();
    }

    return changed;
  }

  addToStage(stage) {
    this.stage = stage;

    this.composer = new Composer(stage.renderer);

    this.updatePasses();
  }

  removeFromStage() {
    this.stage = null;
    this.displays = null;
    this.effects = null;
    this.composer.dispose();
    this.composer = null;
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

    this.updatePasses();

    this.changed = true;

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

    this.updatePasses();

    this.changed = true;

    return true;
  }

  shiftElement(obj, spaces) {
    if (!this.hasElement(obj)) {
      return false;
    }

    const target = this.getTarget(obj);

    this.changed = target.shiftElement(obj, spaces);

    if (this.changed) {
      this.updatePasses();
    }

    return this.changed;
  }

  updatePasses() {
    const {
      composer,
      displays,
      effects,
      stage: { canvasBuffer, webglBuffer },
    } = this;

    composer.clearPasses();
    composer.addPass(canvasBuffer.pass);
    composer.addPass(webglBuffer.pass);

    displays.forEach(display => {
      if (display.pass) {
        composer.addPass(display.pass);
      }
    });

    effects.forEach(effect => {
      if (effect.pass) {
        composer.addPass(effect.pass);
      }
    });
  }

  getCanvasConext() {
    return this.stage.canvasBuffer.context;
  }

  getRenderer() {
    return this.stage.webglBuffer.renderer;
  }

  hasChanges() {
    if (this.changed) {
      return true;
    }

    return !!this.displays.find(e => e.changed);
  }

  resetChanges() {
    this.changed = false;

    this.displays.forEach(display => {
      display.changed = false;
    });

    this.effects.forEach(effect => {
      effect.changed = false;
    });
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
    const { composer, displays, effects } = this;

    this.clear();
    //this.updateReactors(data);

    if (displays.length > 0 || effects.length > 0) {
      displays.forEach(display => {
        if (display.properties.enabled) {
          display.updateReactors(data);
          display.renderToScene(this, data);
        }
      });

      effects.forEach(effect => {
        if (effect.properties.enabled) {
          effect.updateReactors(data);
          effect.renderToScene(this, data);
        }
      });

      composer.render();
    }

    return composer.readBuffer;
  }
}
