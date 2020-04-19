import { Scene as Scene3D, PerspectiveCamera, PointLight } from 'three';
import Display from 'core/Display';
import Effect from 'core/Effect';
import Composer from 'graphics/Composer';
import { add, remove, insert, swap } from 'utils/array';

const FOV = 45;
const NEAR = 1;
const FAR = 10000;
const CAMERA_POS_Z = 250;

export default class Scene extends Display {
  static label = 'Scene';

  static className = 'Scene';

  static defaultProperties = {
    blendMode: 'Normal',
    opacity: 1.0,
    lightIntensity: 1.0,
    lightDistance: 500,
    cameraZoom: 250,
    mask: false,
    inverse: false,
    stencil: false,
  };

  constructor(properties) {
    super(Scene, properties);

    this.stage = null;
    this.displays = [];
    this.effects = [];
    this.reactors = {};
  }

  update(properties) {
    const changed = super.update(properties);
    const { stage, lights, camera } = this;
    const { lightDistance, lightIntensity, cameraZoom } = properties;

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

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(width, height);
  }

  getType(obj) {
    return obj instanceof Effect ? 'effects' : 'displays';
  }

  addElement(obj, index) {
    const type = this.getType(obj);

    if (index !== undefined) {
      this[type] = insert(this[type], index, obj);
    } else {
      this[type] = add(this[type], obj);
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
    const type = this.getType(obj);

    this[type] = remove(this[type], obj);

    obj.scene = null;

    if (obj.removeFromScene) {
      obj.removeFromScene(this);
    }

    this.updatePasses();

    this.changed = true;
  }

  shiftElement(obj, i) {
    const type = this.getType(obj);

    const index = this[type].indexOf(obj);
    this[type] = swap(this[type], index, index + i);

    this.changed = this[type].indexOf(obj) !== index;

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
      stage: { buffer2D, buffer3D },
    } = this;

    composer.clearPasses();
    composer.addPass(buffer2D.pass);
    composer.addPass(buffer3D.pass);

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

  updateLights() {
    const { lights } = this;
    const { lightIntensity, lightDistance } = this.properties;

    lights[0].intensity = lightIntensity;
    lights[1].intensity = lightIntensity;
    lights[2].intensity = lightIntensity;

    lights[0].position.set(0, lightDistance * 2, 0);
    lights[1].position.set(lightDistance, lightDistance * 2, lightDistance);
    lights[2].position.set(-lightDistance, -lightDistance * 2, -lightDistance);
  }

  getContext(type) {
    const {
      stage: { buffer2D, buffer3D },
    } = this;
    return type === 'webgl' ? buffer3D.context : buffer2D.context;
  }

  hasChanges() {
    if (this.changed) {
      return true;
    }

    let changes = false;

    this.displays.forEach(display => {
      if (!changes && display.changed) {
        changes = true;
      }
    });

    return changes;
  }

  resetChanges() {
    this.changed = false;

    this.displays.forEach(display => {
      display.changed = false;
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      properties: this.properties,
      displays: this.displays.map(display => display.toJSON()),
      effects: this.effects.map(effect => effect.toJSON()),
      reactors: this.reactors,
    };
  }

  clear() {
    const {
      composer,
      stage: { buffer2D, buffer3D },
    } = this;

    buffer2D.clear();
    buffer3D.clear();
    composer.clearBuffer();
  }

  render(data) {
    const {
      scene,
      camera,
      composer,
      displays,
      effects,
      stage: { buffer3D },
    } = this;
    let hasGeometry = false;

    this.clear();
    this.updateReactors(data);

    if (displays.length > 0 || effects.length > 0) {
      displays.forEach(display => {
        if (display.properties.enabled) {
          display.updateReactors(data);
          display.renderToScene(this, data);

          if (!hasGeometry && display.hasGeometry) {
            hasGeometry = true;
          }
        }
      });

      if (hasGeometry) {
        buffer3D.renderer.render(scene, camera);
      }

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
