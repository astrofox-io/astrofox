import { Mesh, OrthographicCamera, Scene } from 'three';
import { getFullscreenGeometry } from './common';

export default class Pass {
  static defaultProperties = {
    needsSwap: false,
    clearColor: false,
    clearDepth: false,
    clearStencil: false,
    renderToScreen: false,
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(properties = {}) {
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }

  setFullscreenMaterial(material) {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.geometry = getFullscreenGeometry();

    this.mesh = new Mesh(this.geometry, material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  update(properties = {}) {
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }

  render(renderer, scene, camera, renderTarget) {
    const {
      clearColor,
      clearDepth,
      clearStencil,
      setClearColor,
      setClearAlpha,
      renderToScreen,
    } = this;

    // Set new values
    if (setClearColor) {
      renderer.setClearColor(setClearColor, setClearAlpha);
    }

    // Clear buffers
    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }

    // Render
    renderer.setRenderTarget(renderToScreen ? null : renderTarget);

    renderer.render(scene, camera);

    // Reset values
    if (setClearColor) {
      renderer.setClearColor(renderer.getClearColor(), renderer.getClearAlpha());
    }
  }
}
