export default class ComposerPass {
  static defaultProperties = {
    forceClear: false,
    needsSwap: false,
    clearColor: false,
    clearDepth: false,
    clearStencil: false,
    renderToScreen: false,
    setClearColor: null,
    setClearAlpha: 1.0,
  };

  constructor(properties = {}) {
    Object.defineProperties(
      this,
      Object.entries({ ...ComposerPass.defaultProperties, ...properties }).reduce(
        (obj, [key, value]) => {
          obj[key] = { value, writable: true };
          return obj;
        },
        {},
      ),
    );
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
      forceClear,
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
