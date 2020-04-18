/* eslint-disable react/require-render-return */
import Component from 'core/Component';

export default class ComposerPass extends Component {
  static defaultOptions = {
    enabled: true,
    forceClear: false,
    needsSwap: false,
    clearColor: false,
    clearDepth: false,
    clearStencil: false,
    renderToScreen: false,
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(properties) {
    super({ ...ComposerPass.defaultOptions, ...properties });
  }

  setSize(width, height) {
    if (this.setUniforms) {
      this.setUniforms({ resolution: [width, height] });
    }
  }

  setBlending(
    blending,
    blendEquation,
    blendSrc,
    blendDst,
    blendEquationAlpha,
    blendSrcAlpha,
    blendDstAlpha,
  ) {
    const { material } = this;

    if (material) {
      material.blending = blending;
      material.blendEquation = blendEquation;
      material.blendSrc = blendSrc;
      material.blendDst = blendDst;

      material.blendEquationAlpha = blendEquationAlpha || null;
      material.blendSrcAlpha = blendSrcAlpha || null;
      material.blendDstAlpha = blendDstAlpha || null;
    }
  }

  render(renderer, scene, camera, renderTarget) {
    const {
      clearColor,
      clearDepth,
      clearStencil,
      setClearColor,
      setClearAlpha,
      forceClear,
      renderToScreen,
    } = this.properties;

    // Set new values
    if (setClearColor) {
      renderer.setClearColor(setClearColor, setClearAlpha);
    }

    // Clear buffers
    if (clearColor || clearDepth || clearStencil) {
      renderer.clear(clearColor, clearDepth, clearStencil);
    }

    // Render
    if (renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    } else {
      renderer.setRenderTarget(renderTarget);
      if (forceClear) renderer.clear();
      renderer.render(scene, camera);
    }

    // Reset values
    if (setClearColor) {
      renderer.setClearColor(renderer.getClearColor(), renderer.getClearAlpha());
    }
  }
}
