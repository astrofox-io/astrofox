import {
  Color,
  HalfFloatType,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { planeVertex, shaderMaterial } from './materials';

/** GPU-only intermediate: preserves canvas-style overlap/opacity without any
 * pixel uploads. Capacity grows in blocks and is retained when the layer shrinks. */
export class VectorSurface {
  scene = new Scene();
  private camera = new OrthographicCamera(0, 1, 0, 1, -1, 1);
  private target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false });
  private clearColor = new Color();
  private material = shaderMaterial(
    planeVertex,
    /* glsl */ `
    uniform sampler2D drawing;
    uniform vec2 uvScale;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(drawing, vUv * uvScale);
      // Source-over blending stores premultiplied RGB in the intermediate.
      if (c.a > 0.0) c.rgb /= c.a;
      gl_FragColor = vec4(c.rgb, c.a * opacity);
      #include <colorspace_fragment>
    }
  `,
  );
  object = new Mesh(new PlaneGeometry(1, 1), this.material);
  private width = 1;
  private height = 1;

  constructor() {
    this.target.samples = 4;
    this.material.uniforms = {
      drawing: { value: this.target.texture },
      uvScale: { value: new Vector2(1, 1) },
      opacity: { value: 1 },
    };
    this.object.onBeforeRender = renderer => this.render(renderer);
  }

  setSize(width: number, height: number, p: Record<string, unknown>) {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    const zoom = Number(p.zoom ?? 1);
    this.object.scale.set(this.width * zoom, this.height * zoom, 1);
    this.material.uniforms.opacity.value = Math.max(0, Math.min(1, Number(p.opacity ?? 1)));
    this.camera.right = this.width;
    this.camera.bottom = this.height;
    this.camera.updateProjectionMatrix();
  }

  private render(renderer: WebGLRenderer) {
    const maxSize = renderer.capabilities.maxTextureSize;
    const width = Math.min(this.width, maxSize);
    const height = Math.min(this.height, maxSize);
    if (width > this.target.width || height > this.target.height) {
      this.target.setSize(
        Math.min(maxSize, Math.max(this.target.width, Math.ceil(width / 128) * 128)),
        Math.min(maxSize, Math.max(this.target.height, Math.ceil(height / 128) * 128)),
      );
    }
    this.target.viewport.set(0, 0, width, height);
    this.material.uniforms.uvScale.value.set(
      width / this.target.width,
      height / this.target.height,
    );
    const previousTarget = renderer.getRenderTarget();
    const previousFace = renderer.getActiveCubeFace();
    const previousMip = renderer.getActiveMipmapLevel();
    const autoClear = renderer.autoClear;
    const alpha = renderer.getClearAlpha();
    renderer.getClearColor(this.clearColor);
    try {
      renderer.autoClear = false;
      renderer.setRenderTarget(this.target);
      renderer.setClearColor(0, 0);
      renderer.clear();
      renderer.render(this.scene, this.camera);
    } finally {
      renderer.setRenderTarget(previousTarget, previousFace, previousMip);
      renderer.setClearColor(this.clearColor, alpha);
      renderer.autoClear = autoClear;
    }
  }

  dispose() {
    this.target.dispose();
    this.object.geometry.dispose();
    this.material.dispose();
  }
}
