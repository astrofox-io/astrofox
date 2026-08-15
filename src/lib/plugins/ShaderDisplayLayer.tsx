// @ts-nocheck

import { useFrame } from '@react-three/fiber';
import React from 'react';
import { LinearFilter, RGBAFormat, Vector2, WebGLRenderTarget } from 'three';
import FFTParser from '@/lib/audio/FFTParser';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import { TexturePlane } from '@/lib/core/render/layers';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';
import { applyUniform, defaultUniformValue } from './shaderEffectFactory';

/**
 * Stage layer for shader-runtime display plugins (Shadertoy-style generative
 * layers). The plugin's fragment shader renders into a private render target
 * each frame with time/audio uniforms, and the result is presented through
 * the standard TexturePlane, so transforms, blending and reactors behave
 * like any core 2D display.
 */
export function ShaderDisplayLayer({ installed, display, order, frameData, ...sceneProps }) {
  const { manifest } = installed;
  const fragmentShader = installed.files[manifest.shader];
  const properties = display.properties || {};
  const { x = 0, y = 0, rotation = 0, zoom = 1, opacity = 1 } = properties;
  const width = Math.max(1, Math.round(Number(properties.width) || 512));
  const height = Math.max(1, Math.round(Number(properties.height) || 512));

  const fftConfig = manifest.audio?.fft || null;
  const stateRef = React.useRef({ time: 0, lastFrameId: null });
  const parserRef = React.useRef(null);

  const target = React.useMemo(
    () =>
      new WebGLRenderTarget(width, height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        depthBuffer: false,
        stencilBuffer: false,
      }),
    [],
  );

  React.useEffect(() => {
    target.setSize(width, height);
  }, [target, width, height]);

  const pass = React.useMemo(() => {
    const uniforms = {
      resolution: { value: new Vector2(width, height) },
      time: { value: 0 },
      delta: { value: 0 },
      volume: { value: 0 },
    };

    if (fftConfig) {
      uniforms.fft = { value: new Float32Array(fftConfig.bins) };
    }

    for (const [name, def] of Object.entries(manifest.uniforms || {})) {
      if (uniforms[name] === undefined) {
        uniforms[name] = { value: defaultUniformValue(def) };
      }
    }

    const shaderPass = new ShaderPass({ uniforms, vertexShader, fragmentShader });
    shaderPass.material.transparent = true;
    return shaderPass;
  }, [fragmentShader]);

  React.useEffect(() => {
    return () => {
      pass.dispose?.();
      target.dispose();
    };
  }, [pass, target]);

  useFrame(({ gl }) => {
    const uniforms = pass.material.uniforms;
    const state = stateRef.current;

    if (frameData?.hasUpdate && frameData.id !== state.lastFrameId) {
      state.time += (frameData.delta || 0) / 1000;
      state.lastFrameId = frameData.id;
    }

    uniforms.resolution.value.set(width, height);
    uniforms.time.value = state.time;
    uniforms.delta.value = frameData?.delta ?? 0;
    uniforms.volume.value = frameData?.volume ?? 0;

    if (fftConfig && uniforms.fft && frameData?.fft) {
      if (!parserRef.current) {
        parserRef.current = new FFTParser({
          minFrequency: fftConfig.minFrequency,
          maxFrequency: fftConfig.maxFrequency,
          smoothingTimeConstant: fftConfig.smoothing,
          minDecibels: fftConfig.minDecibels,
          maxDecibels: fftConfig.maxDecibels,
        });
      }
      uniforms.fft.value.set(parserRef.current.parseFFT(frameData.fft, fftConfig.bins));
    }

    for (const [name, def] of Object.entries(manifest.uniforms || {})) {
      const uniform = uniforms[name];
      if (uniform !== undefined) {
        applyUniform(uniform, def, properties);
      }
    }

    const prevTarget = gl.getRenderTarget();
    pass.render(gl, null, target);
    gl.setRenderTarget(prevTarget);
  }, -2);

  return (
    <TexturePlane
      texture={target.texture}
      width={width}
      height={height}
      x={x}
      y={y}
      originX={Math.round(width / 2)}
      originY={Math.round(height / 2)}
      rotation={rotation}
      zoom={zoom}
      opacity={opacity}
      renderOrder={order}
      {...sceneProps}
    />
  );
}
