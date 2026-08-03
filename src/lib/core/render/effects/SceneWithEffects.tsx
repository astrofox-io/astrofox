// @ts-nocheck
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import { Color, OrthographicCamera, Scene as ThreeScene } from 'three';
import { PassChain } from '../PassChain';
import { createRawEffect } from './createRawEffect';
import { createScenePass } from './createScenePass';

const LIVE_UPDATABLE_EFFECTS = new Set([
  'BloomEffect',
  'BlurEffect',
  'BrightnessContrastEffect',
  'ColorEffect',
  'ColorHalftoneEffect',
  'ColorDepthEffect',
  'DistortionEffect',
  'DotScreenEffect',
  'GlitchEffect',
  'HueSaturationEffect',
  'KaleidoscopeEffect',
  'LEDEffect',
  'MirrorEffect',
  'NoiseEffect',
  'PerlinNoiseEffect',
  'PixelateEffect',
  'RGBShiftEffect',
  'SepiaEffect',
  'ToneMappingEffect',
]);

const STRUCTURAL_EFFECT_PROPS = {
  BlurEffect: ['type'],
  ColorEffect: ['colorAverageEnabled', 'colorDepthEnabled', 'toneMappingEnabled'],
  PixelateEffect: ['type'],
};

function getEffectBuildKey(effect) {
  const base = {
    id: effect.id,
    name: effect.name,
  };

  if (!LIVE_UPDATABLE_EFFECTS.has(effect.name)) {
    return {
      ...base,
      properties: effect.properties,
    };
  }

  const structuralKeys = STRUCTURAL_EFFECT_PROPS[effect.name] || [];
  if (structuralKeys.length === 0) {
    return base;
  }

  const structuralProps = {};
  for (const key of structuralKeys) {
    structuralProps[key] = effect.properties?.[key];
  }

  return {
    ...base,
    properties: structuralProps,
  };
}

export function SceneWithEffects({
  width,
  height,
  effects,
  frameData,
  renderOrder = 0,
  onTexture,
  outputToScreen = true,
  children,
}) {
  const gl = useThree(state => state.gl);
  const onTextureRef = React.useRef(onTexture);

  React.useEffect(() => {
    onTextureRef.current = onTexture;
  }, [onTexture]);

  // Portal scene for children (2D + 3D displays)
  const sceneObj = React.useMemo(() => new ThreeScene(), []);
  const camera = React.useMemo(() => {
    const cam = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
    cam.position.set(0, 0, 10);
    cam.updateProjectionMatrix();
    return cam;
  }, []);

  React.useEffect(() => {
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  // PassChain — v1-style ping-pong buffer management
  const chainRef = React.useRef(null);

  if (!chainRef.current) {
    chainRef.current = new PassChain(width, height);
  }

  React.useEffect(() => {
    chainRef.current?.setSize(width, height);
  }, [width, height]);

  React.useEffect(() => {
    return () => {
      onTextureRef.current?.(null);
      chainRef.current?.dispose();
    };
  }, []);

  // Rebuild passes when effect list or structural properties change
  const effectKey = JSON.stringify(effects.map(getEffectBuildKey));
  const passesRef = React.useRef([]);
  React.useEffect(() => {
    const builtPasses = [];
    const addPassItem = item => {
      if (!item) {
        return;
      }

      if (Array.isArray(item)) {
        for (const child of item) {
          addPassItem(child);
        }
        return;
      }

      builtPasses.push(item);
    };

    for (const effect of effects) {
      let item = null;

      try {
        item = createScenePass(effect, width, height);
      } catch {
        item = null;
      }

      if (item) {
        builtPasses.push(item);
        continue;
      }

      try {
        item = createRawEffect(effect, width, height);
      } catch {
        item = null;
      }

      if (!item) {
        continue;
      }

      addPassItem(item);
    }

    for (const pass of builtPasses) {
      try {
        pass.setSize?.(width, height);
      } catch {
        // Ignore sizing errors and continue rendering with remaining passes.
      }
    }

    const previousPasses = passesRef.current;
    passesRef.current = builtPasses;
    for (const pass of previousPasses) {
      if (!builtPasses.includes(pass)) {
        try {
          pass.dispose?.();
        } catch {
          // Ignore dispose errors
        }
      }
    }
  }, [effectKey, camera, gl, width, height]);

  const tempColor = React.useRef(new Color());
  const meshRef = React.useRef();

  useFrame((_, delta) => {
    const chain = chainRef.current;
    if (!chain) return;

    for (const pass of passesRef.current) {
      try {
        pass.__updateScenePass?.(frameData);
      } catch {
        // Ignore live uniform update errors and continue rendering.
      }
    }

    // Disable autoClear — EffectComposer used to do this as a side effect
    // of setRenderer(). Without it, gl.render() auto-clears our manually
    // cleared opaque-black buffer with the canvas clear color (alpha=0).
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;

    // Step 1: Render scene content directly to chain's inputBuffer
    // Clear to transparent black so the composed scene can blend with scenes below it.
    gl.getClearColor(tempColor.current);
    const prevClearAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(chain.inputBuffer);
    gl.clear();
    gl.setClearColor(tempColor.current, prevClearAlpha);
    gl.render(sceneObj, camera);

    // Step 2: Run PassChain when effects are available.
    // If there are no passes (e.g. while toggling/rebuilding), keep a passthrough
    // frame in inputBuffer so the output plane never falls back to white.
    if (passesRef.current.length > 0) {
      chain.render(gl, passesRef.current, delta);
    }

    gl.setRenderTarget(null);
    gl.autoClear = prevAutoClear;

    // Step 3: Update output mesh with composited result
    onTextureRef.current?.(chain.inputBuffer.texture);

    if (outputToScreen && meshRef.current) {
      const material = meshRef.current.material;
      if (material.map !== chain.inputBuffer.texture) {
        material.map = chain.inputBuffer.texture;
        material.needsUpdate = true;
      }
    }
  }, -1);

  return (
    <>
      {createPortal(children, sceneObj)}
      {outputToScreen ? (
        <mesh ref={meshRef} renderOrder={renderOrder}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            transparent={true}
            premultipliedAlpha={true}
            toneMapped={false}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </>
  );
}
