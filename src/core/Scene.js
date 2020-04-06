import { Scene as Scene3D, PerspectiveCamera, PointLight } from 'three';
import List from 'core/List';
import Display from 'core/Display';
import Effect from 'core/Effect';
import Composer from 'graphics/Composer';

const FOV = 45;
const NEAR = 1;
const FAR = 10000;
const CAMERA_POS_Z = 250;

export default class Scene extends Display {
  static label = 'Scene';

  static className = 'Scene';

  static defaultOptions = {
    blendMode: 'Normal',
    opacity: 1.0,
    lightIntensity: 1.0,
    lightDistance: 500,
    cameraZoom: 250,
    mask: false,
    inverse: false,
    stencil: false,
  };

  constructor(options) {
    super(Scene, options);

    this.stage = null;
    this.displays = new List();
    this.effects = new List();
    this.reactors = {};
  }

  update(options) {
    const changed = super.update(options);
    const { stage, lights, camera } = this;
    const { lightDistance, lightIntensity, cameraZoom } = options;

    if (changed) {
      if (stage) {
        this.updatePasses();

        if (lights && (lightDistance !== undefined || lightIntensity !== undefined)) {
          this.updateLights();
        }

        if (camera && cameraZoom !== undefined) {
          camera.position.z = cameraZoom;
        }
      }
    }

    return changed;
  }

  addToStage(stage) {
    const { width, height } = stage.getSize();

    this.stage = stage;

    this.buffer2D = stage.buffer2D;
    this.buffer3D = stage.buffer3D;

    this.composer = new Composer(stage.renderer);
    this.scene = new Scene3D();

    this.camera = new PerspectiveCamera(FOV, width / height, NEAR, FAR);
    this.camera.position.set(0, 0, CAMERA_POS_Z);

    this.lights = [
      new PointLight(0xffffff, 1, 0),
      new PointLight(0xffffff, 1, 0),
      new PointLight(0xffffff, 1, 0),
    ];

    this.scene.add(this.camera);
    this.scene.add(this.lights[0]);
    this.scene.add(this.lights[1]);
    this.scene.add(this.lights[2]);

    // this.scene.fog = new THREE.Fog(0x000000, NEAR, FAR);

    this.updatePasses();
    this.updateLights();
  }

  removeFromStage() {
    this.stage = null;
    this.displays.clear();
    this.displays = null;
    this.effects.clear();
    this.effects = null;
    this.composer.dispose();
    this.composer = null;
  }

  getSize() {
    return this.composer.getSize();
  }

  setSize(width, height) {
    this.displays.items.forEach(display => {
      if (display.setSize) {
        display.setSize(width, height);
      }
    });

    this.effects.items.forEach(effect => {
      if (effect.setSize) {
        effect.setSize(width, height);
      }
    });

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(width, height);
  }

  addElement(obj, index) {
    let list;

    if (obj instanceof Effect) {
      list = this.effects;
    } else if (obj instanceof Display) {
      list = this.displays;
    }

    if (index !== undefined) {
      list.insert(index, obj);
    } else {
      list.add(obj);
    }

    obj.scene = this;

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
    let list;

    if (obj instanceof Effect) {
      list = this.effects;
    } else if (obj instanceof Display) {
      list = this.displays;
    } else {
      throw new Error('Invalid element');
    }

    list.remove(obj);

    obj.scene = null;

    if (obj.removeFromScene) {
      obj.removeFromScene(this);
    }

    this.updatePasses();

    this.changed = true;
  }

  shiftElement(obj, i) {
    let list;

    if (obj instanceof Effect) {
      list = this.effects;
    } else if (obj instanceof Display) {
      list = this.displays;
    } else {
      throw new Error('Invalid element');
    }

    const index = list.indexOf(obj);

    this.changed = list.swap(index, index + i);

    if (this.changed) {
      this.updatePasses();
    }

    return this.changed;
  }

  updatePasses() {
    const { composer } = this;

    composer.clearPasses();
    composer.addPass(this.buffer2D.pass);
    composer.addPass(this.buffer3D.pass);

    this.displays.items.forEach(display => {
      if (display.pass) {
        composer.addPass(display.pass);
      }
    });

    this.effects.items.forEach(effect => {
      if (effect.pass) {
        composer.addPass(effect.pass);
      }
    });
  }

  updateLights() {
    const { lights } = this;
    const { lightIntensity, lightDistance } = this.options;

    lights[0].intensity = lightIntensity;
    lights[1].intensity = lightIntensity;
    lights[2].intensity = lightIntensity;

    lights[0].position.set(0, lightDistance * 2, 0);
    lights[1].position.set(lightDistance, lightDistance * 2, lightDistance);
    lights[2].position.set(-lightDistance, -lightDistance * 2, -lightDistance);
  }

  getContext(type) {
    return type === 'webgl' ? this.buffer3D.context : this.buffer2D.context;
  }

  hasChanges() {
    if (this.changed) {
      return true;
    }

    let changes = false;

    this.displays.items.forEach(display => {
      if (!changes && display.changed) {
        changes = true;
      }
    });

    return changes;
  }

  resetChanges() {
    this.changed = false;

    this.displays.items.forEach(display => {
      display.changed = false;
    });
  }

  toJSON() {
    return {
      name: this.name,
      options: this.options,
      displays: this.displays.items.map(display => display.toJSON()),
      effects: this.effects.items.map(effect => effect.toJSON()),
      reactors: this.reactors,
    };
  }

  clear() {
    this.buffer2D.clear();
    this.buffer3D.clear();
    this.composer.clearBuffer();
  }

  render(data) {
    const { composer, displays, effects } = this;
    let hasGeometry = false;

    this.clear();
    this.updateReactors(data);

    if (displays.length > 0 || effects.length > 0) {
      displays.items.forEach(display => {
        if (display.options.enabled) {
          display.updateReactors(data);
          display.renderToScene(this, data);

          if (!hasGeometry && display.hasGeometry) {
            hasGeometry = true;
          }
        }
      });

      if (hasGeometry) {
        this.buffer3D.renderer.render(this.scene, this.camera);
      }

      effects.items.forEach(effect => {
        if (effect.options.enabled) {
          effect.updateReactors(data);
          effect.renderToScene(this, data);
        }
      });

      composer.render();
    }

    return composer.readBuffer;
  }
}
