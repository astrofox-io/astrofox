// @ts-nocheck

import type { WebGLRenderTarget } from 'three';
import { createRenderTarget } from '../../composer/common';
import Pass from '../../composer/Pass';
import ShaderPass from '../../composer/ShaderPass';
import FeedbackShader from '../shaders/FeedbackShader';

// Plain blit used to keep a copy of the blended output for the next frame.
const BlitShader = {
  uniforms: {
    inputTexture: { type: 't', value: null },
  },
  vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
uniform sampler2D inputTexture;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(inputTexture, vUv);
}
`,
};

/**
 * Frame feedback: blends the current frame with a decayed copy of the
 * previous output, then stores the result for the next frame.
 */
export default class FeedbackPass extends Pass {
  declare accumulate: boolean;
  declare feedbackBuffer: WebGLRenderTarget;
  declare blendPass: ShaderPass;
  declare copyPass: ShaderPass;

  constructor(width = 1, height = 1) {
    super();

    this.needsSwap = true;
    this.accumulate = true;
    this.feedbackBuffer = createRenderTarget(Math.max(1, width), Math.max(1, height));
    this.blendPass = new ShaderPass(FeedbackShader);
    this.copyPass = new ShaderPass(BlitShader);
  }

  setUniforms(uniforms) {
    this.blendPass.setUniforms(uniforms);
  }

  setSize(width, height) {
    this.feedbackBuffer.setSize(Math.max(1, width), Math.max(1, height));
  }

  render(renderer, inputBuffer, outputBuffer) {
    // Blend current frame with accumulated feedback -> outputBuffer
    this.blendPass.setUniforms({ feedbackTexture: this.feedbackBuffer.texture });
    this.blendPass.render(renderer, inputBuffer, outputBuffer);

    // Store the result for the next frame (frozen while playback is paused)
    if (this.accumulate) {
      this.copyPass.render(renderer, outputBuffer, this.feedbackBuffer);
    }
  }

  dispose() {
    this.feedbackBuffer.dispose();
    this.blendPass.dispose();
    this.copyPass.dispose();
  }
}
