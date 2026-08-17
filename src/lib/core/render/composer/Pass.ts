// @ts-nocheck
import { Color, Mesh, OrthographicCamera, Scene } from 'three';
import { getFullscreenGeometry } from './common';

export default class Pass {
  // Declared so TypeScript consumers of the (untyped) pass classes see the
  // shared fields; values are assigned in the constructor.
  declare enabled: boolean;
  declare needsSwap: boolean;
  declare clearColor: boolean;
  declare clearDepth: boolean;
  declare clearStencil: boolean;
  declare renderToScreen: boolean;
  declare setClearColor: unknown;
  declare setClearAlpha: number;
  declare scene: Scene;
  declare camera: OrthographicCamera;
  declare geometry: unknown;
  declare material: unknown;
  declare mesh: Mesh;

  constructor() {
    this.enabled = true;
    this.needsSwap = false;
    this.clearColor = false;
    this.clearDepth = false;
    this.clearStencil = false;
    this.renderToScreen = false;
    this.setClearColor = null;
    this.setClearAlpha = 1.0;
  }

  setFullscreen(material, geometry, camera) {
    this.scene = new Scene();
    this.camera = camera || new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.geometry = geometry || getFullscreenGeometry();
    this.material = material;

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  dispose() {
    this.material?.dispose?.();
  }

  update(properties = {}) {
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }

  render(renderer, scene, camera, renderTarget) {
    const { clearColor, clearDepth, clearStencil, setClearColor, setClearAlpha, renderToScreen } =
      this;

    const oldColor = new Color();
    const oldAlpha = renderer.getClearAlpha();

    if (setClearColor) {
      renderer.getClearColor(oldColor);
      renderer.setClearColor(setClearColor, setClearAlpha);
    }

    renderer.setRenderTarget(renderToScreen ? null : renderTarget);

    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }

    renderer.render(scene, camera);

    if (setClearColor) {
      renderer.setClearColor(oldColor, oldAlpha);
    }
  }
}
