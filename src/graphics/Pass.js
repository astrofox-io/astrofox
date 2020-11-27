import { Mesh, OrthographicCamera, Scene } from 'three';
import { getFullscreenGeometry } from './common';

export default class Pass {
  constructor() {
    this.needsSwap = false;
    this.clearColor = false;
    this.clearDepth = false;
    this.clearStencil = false;
    this.renderToScreen = false;
    this.setClearColor = null;
    this.setClearAlpha = 1.0;
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
