// @ts-nocheck
import { Vector2 } from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import Pass from '../../composer/Pass';

export default class UnrealBloomEffectPass extends Pass {
  constructor({
    width = 1,
    height = 1,
    exposure = 1,
    strength = 1.5,
    radius = 0,
    threshold = 0,
  } = {}) {
    super();

    this.unrealBloomPass = new UnrealBloomPass(
      new Vector2(
        Math.max(1, Math.floor(Number(width || 1))),
        Math.max(1, Math.floor(Number(height || 1))),
      ),
      0,
      Number(radius ?? 0),
      Number(threshold ?? 0),
    );
    this.patchBloomAlpha();
    this.needsSwap = false;
    this.updateOptions({
      exposure,
      strength,
      radius,
      threshold,
    });
  }

  patchBloomAlpha() {
    for (const material of this.unrealBloomPass.separableBlurMaterials || []) {
      if (!material?.fragmentShader?.includes('gl_FragColor = vec4(diffuseSum/weightSum, 1.0);')) {
        continue;
      }

      // Preserve blurred alpha so bloom can composite as a soft halo instead of an opaque wash.
      material.fragmentShader = material.fragmentShader
        .replace(
          'vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;',
          'vec4 diffuseSum = texture2D( colorTexture, vUv ) * weightSum;',
        )
        .replace(
          'vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;',
          'vec4 sample1 = texture2D( colorTexture, vUv + uvOffset );',
        )
        .replace(
          'vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;',
          'vec4 sample2 = texture2D( colorTexture, vUv - uvOffset );',
        )
        .replace(
          'gl_FragColor = vec4(diffuseSum/weightSum, 1.0);',
          'gl_FragColor = diffuseSum / weightSum;',
        );
      material.needsUpdate = true;
    }
  }

  updateOptions({ exposure = 1, strength = 1.5, radius = 0, threshold = 0 } = {}) {
    const exposureScale = Math.max(0, Number(exposure ?? 1)) ** 4;
    this.unrealBloomPass.strength = Number(strength ?? 1.5) * exposureScale;
    this.unrealBloomPass.radius = Number(radius ?? 0);
    this.unrealBloomPass.threshold = Number(threshold ?? 0);
  }

  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    this.unrealBloomPass.render(renderer, outputBuffer, inputBuffer, deltaTime, stencilTest);
  }

  setSize(width, height) {
    this.unrealBloomPass.setSize(width, height);
  }

  dispose() {
    super.dispose();
    this.unrealBloomPass?.dispose?.();
  }
}
