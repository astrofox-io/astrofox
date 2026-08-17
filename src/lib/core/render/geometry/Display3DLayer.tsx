// @ts-nocheck

import { createPortal, useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import {
  AxesHelper,
  DepthFormat,
  DepthTexture,
  HalfFloatType,
  LinearFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  RGBAFormat,
  Scene as ThreeScene,
  UnsignedIntType,
  WebGLRenderTarget,
} from 'three';
import { updateElementProperties } from '@/app/actions/scenes';
import ShaderPass from '../composer/ShaderPass';
import DepthOfFieldShader from '../effects/shaders/DepthOfFieldShader';
import { DisplayLights3D } from './DisplayLights3D';

export const PERSPECTIVE_FOV = 50;
const CAMERA_PERSIST_DELAY_MS = 120;

/**
 * Exposes the host's private camera/viewport to the 3D content rendered
 * inside a Display3DLayer (e.g. TunnelDisplayLayer3D follows the camera).
 */
export const Display3DContext = React.createContext({
  camera: null,
  width: 0,
  height: 0,
});

export function useDisplay3D() {
  return React.useContext(Display3DContext);
}

export function getDefaultCameraDistance(height, fov = PERSPECTIVE_FOV) {
  return height / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
}

function createRenderTarget(width, height, withDepth = false) {
  const target = new WebGLRenderTarget(width, height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    type: HalfFloatType,
    depthBuffer: withDepth,
    stencilBuffer: false,
  });

  if (withDepth) {
    target.depthTexture = new DepthTexture(width, height, UnsignedIntType);
    target.depthTexture.format = DepthFormat;
  }

  return target;
}

/**
 * Per-display 3D host. Each "has a camera" display renders its own three.js
 * scene (own perspective camera, own lighting rig, optional depth of field)
 * into a private render target, and presents the result as a full-stage
 * textured plane in the ordinary 2D layer stack.
 *
 * Camera state lives on the display (`cameraAzimuth`, `cameraPolar`,
 * `cameraDistance`); when `cameraModeActive` the stage canvas becomes an
 * orbit controller for this display's camera.
 */
export function Display3DLayer({
  display,
  order = 0,
  width,
  height,
  cameraModeActive = false,
  children,
}) {
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  const properties = display?.properties || {};
  const displayId = display?.id;
  const depthOfFieldEnabled = Boolean(properties.depthOfField);
  const cameraAxisScale = React.useMemo(
    () => Math.max(48, Math.min(width, height) * 0.12),
    [height, width],
  );

  const cameraZ = React.useMemo(() => getDefaultCameraDistance(height), [height]);

  const perspScene = React.useMemo(() => new ThreeScene(), []);
  const cameraAxisHelper = React.useMemo(() => {
    const helper = new AxesHelper(1);
    helper.renderOrder = 1000;
    helper.frustumCulled = false;
    helper.traverse(child => {
      const materials = Array.isArray(child.material)
        ? child.material
        : child.material
          ? [child.material]
          : [];

      for (const material of materials) {
        material.depthTest = false;
        material.depthWrite = false;
        material.transparent = true;
        material.opacity = 0.95;
        material.toneMapped = false;
      }
    });
    return helper;
  }, []);

  const perspCamera = React.useMemo(() => {
    const cam = new PerspectiveCamera(PERSPECTIVE_FOV, width / height, 0.1, 5000);
    cam.position.set(0, 0, cameraZ);
    cam.lookAt(0, 0, 0);
    return cam;
  }, []);

  const clampPolar = React.useCallback(
    value => Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, value)),
    [],
  );
  const clampDistance = React.useCallback(value => Math.max(50, Math.min(5000, value)), []);
  const cameraStateRef = React.useRef({
    azimuth: 0,
    polar: 0,
    distance: cameraZ,
  });
  const dragStateRef = React.useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const persistTimeoutRef = React.useRef(null);

  const applyCameraState = React.useCallback(
    nextState => {
      cameraStateRef.current = nextState;

      const cosPolar = Math.cos(nextState.polar);
      const x = Math.sin(nextState.azimuth) * cosPolar * nextState.distance;
      const y = Math.sin(nextState.polar) * nextState.distance;
      const z = Math.cos(nextState.azimuth) * cosPolar * nextState.distance;

      perspCamera.position.set(x, y, z);
      perspCamera.lookAt(0, 0, 0);
      perspCamera.updateProjectionMatrix();
      invalidate();
    },
    [invalidate, perspCamera],
  );

  const persistCameraState = React.useCallback(
    nextState => {
      if (!displayId) {
        return;
      }

      updateElementProperties(displayId, {
        cameraAzimuth: nextState.azimuth,
        cameraPolar: nextState.polar,
        cameraDistance: nextState.distance,
      });
    },
    [displayId],
  );

  React.useLayoutEffect(() => {
    perspCamera.aspect = width / height;
    applyCameraState(cameraStateRef.current);
  }, [applyCameraState, perspCamera, width, height, cameraZ]);

  // Display properties are mutated in place by the control panel, so React
  // props never change identity; request a frame explicitly whenever a DoF
  // value changes so the pass re-runs with the new uniforms after commit.
  const focusDistance = properties.focusDistance;
  const focalLength = properties.focalLength;
  const bokehScale = properties.bokehScale;
  const dofHeight = properties.dofHeight;

  React.useLayoutEffect(() => {
    invalidate();
  }, [invalidate, depthOfFieldEnabled, focusDistance, focalLength, bokehScale, dofHeight]);

  React.useEffect(() => {
    if (!gl.shadowMap.enabled) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = PCFSoftShadowMap;
    }
  }, [gl]);

  React.useEffect(() => {
    cameraAxisHelper.scale.setScalar(cameraAxisScale);
  }, [cameraAxisHelper, cameraAxisScale]);

  const cameraAzimuth = properties.cameraAzimuth;
  const cameraPolar = properties.cameraPolar;
  const cameraDistance = properties.cameraDistance;

  // Layout effect + invalidate: the backend requests a frame right after
  // root.render(), which can run before a passive effect commits the new
  // camera pose (leaving the stage one control change behind).
  React.useLayoutEffect(() => {
    if (dragStateRef.current.active) {
      return;
    }

    applyCameraState({
      azimuth: Number(cameraAzimuth ?? 0),
      polar: clampPolar(Number(cameraPolar ?? 0)),
      distance: clampDistance(Number(cameraDistance ?? cameraZ) || cameraZ),
    });
  }, [
    applyCameraState,
    cameraZ,
    clampDistance,
    clampPolar,
    cameraAzimuth,
    cameraDistance,
    cameraPolar,
  ]);

  React.useEffect(() => {
    if (!cameraModeActive) {
      return;
    }

    const element = gl.domElement;
    const ownerDocument = element.ownerDocument;
    element.style.cursor = 'grab';

    function clearPersistTimeout() {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    }

    function schedulePersist(nextState) {
      clearPersistTimeout();
      persistTimeoutRef.current = window.setTimeout(() => {
        persistTimeoutRef.current = null;
        persistCameraState(nextState);
      }, CAMERA_PERSIST_DELAY_MS);
    }

    function handlePointerDown(event) {
      if (event.button !== 0) {
        return;
      }

      dragStateRef.current.active = true;
      dragStateRef.current.lastX = event.clientX;
      dragStateRef.current.lastY = event.clientY;
      element.style.cursor = 'grabbing';
      event.preventDefault();
    }

    function handlePointerMove(event) {
      if (!dragStateRef.current.active) {
        return;
      }

      const dx = event.clientX - dragStateRef.current.lastX;
      const dy = event.clientY - dragStateRef.current.lastY;
      dragStateRef.current.lastX = event.clientX;
      dragStateRef.current.lastY = event.clientY;

      applyCameraState({
        ...cameraStateRef.current,
        azimuth: cameraStateRef.current.azimuth - dx * 0.01,
        polar: clampPolar(cameraStateRef.current.polar - dy * 0.01),
      });
    }

    function handlePointerUp() {
      if (!dragStateRef.current.active) {
        return;
      }

      dragStateRef.current.active = false;
      element.style.cursor = 'grab';
      clearPersistTimeout();
      persistCameraState(cameraStateRef.current);
    }

    function handleWheel(event) {
      event.preventDefault();

      const nextState = {
        ...cameraStateRef.current,
        distance: clampDistance(cameraStateRef.current.distance * Math.exp(event.deltaY * 0.0015)),
      };

      applyCameraState(nextState);
      schedulePersist(nextState);
    }

    element.addEventListener('pointerdown', handlePointerDown);
    ownerDocument.addEventListener('pointermove', handlePointerMove);
    ownerDocument.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearPersistTimeout();
      dragStateRef.current.active = false;
      element.style.cursor = '';
      element.removeEventListener('pointerdown', handlePointerDown);
      ownerDocument.removeEventListener('pointermove', handlePointerMove);
      ownerDocument.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [applyCameraState, cameraModeActive, clampDistance, clampPolar, gl, persistCameraState]);

  const colorTarget = React.useMemo(() => createRenderTarget(width, height, true), []);
  const effectTarget = React.useMemo(() => createRenderTarget(width, height, false), []);
  const dofPassRef = React.useRef(null);
  const materialRef = React.useRef(null);

  if (depthOfFieldEnabled && !dofPassRef.current) {
    dofPassRef.current = new ShaderPass(DepthOfFieldShader);
  }

  const multisampleCount = React.useMemo(() => (gl.capabilities.isWebGL2 ? 4 : 0), [gl]);

  // DoF runs at a reduced height (default 480) to keep the 16-tap bokeh cheap.
  const dofRenderHeight = React.useMemo(() => {
    const requested = Math.max(1, Math.round(Number(dofHeight ?? 480) || height));
    return Math.min(requested, Math.max(1, height));
  }, [dofHeight, height]);
  const dofRenderWidth = React.useMemo(
    () => (height > 0 ? Math.max(1, Math.round((width * dofRenderHeight) / height)) : width),
    [dofRenderHeight, height, width],
  );

  React.useLayoutEffect(() => {
    colorTarget.setSize(width, height);
    const targetWidth = depthOfFieldEnabled ? dofRenderWidth : width;
    const targetHeight = depthOfFieldEnabled ? dofRenderHeight : height;
    effectTarget.setSize(targetWidth, targetHeight);
    dofPassRef.current?.setSize(targetWidth, targetHeight);
  }, [
    colorTarget,
    effectTarget,
    width,
    height,
    depthOfFieldEnabled,
    dofRenderWidth,
    dofRenderHeight,
  ]);

  React.useEffect(() => {
    colorTarget.samples = multisampleCount;
    effectTarget.samples = multisampleCount;
  }, [colorTarget, effectTarget, multisampleCount]);

  React.useEffect(() => {
    return () => {
      cameraAxisHelper.dispose();
      colorTarget.dispose();
      effectTarget.dispose();
      dofPassRef.current?.dispose?.();
    };
  }, [cameraAxisHelper, colorTarget, effectTarget]);

  const outputTexture =
    depthOfFieldEnabled && colorTarget.depthTexture ? effectTarget.texture : colorTarget.texture;

  React.useLayoutEffect(() => {
    const material = materialRef.current;
    if (!material) {
      return;
    }

    material.map = outputTexture;
    material.needsUpdate = true;
    invalidate();
  }, [invalidate, outputTexture]);

  const contextValue = React.useMemo(
    () => ({ camera: perspCamera, width, height }),
    [perspCamera, width, height],
  );

  useFrame(() => {
    const prevClearAlpha = gl.getClearAlpha();
    gl.setClearAlpha(0);
    gl.setRenderTarget(colorTarget);
    gl.clear();
    gl.render(perspScene, perspCamera);

    if (depthOfFieldEnabled && colorTarget.depthTexture && dofPassRef.current) {
      dofPassRef.current.setUniforms({
        depthTexture: colorTarget.depthTexture,
        nearClip: perspCamera.near,
        farClip: perspCamera.far,
        focusDistance: Number(properties.focusDistance ?? 0),
        focalLength: Number(properties.focalLength ?? 0.02),
        bokehScale: Number(properties.bokehScale ?? 2),
        resolutionScale: dofRenderHeight / Math.max(1, height),
      });
      dofPassRef.current.render(gl, colorTarget, effectTarget);
    }

    gl.setRenderTarget(null);
    gl.setClearAlpha(prevClearAlpha);
  }, -2);

  return (
    <>
      {createPortal(
        <Display3DContext.Provider value={contextValue}>
          <DisplayLights3D properties={properties} width={width} height={height} />
          {children}
          {cameraModeActive ? <primitive object={cameraAxisHelper} /> : null}
        </Display3DContext.Provider>,
        perspScene,
      )}
      <mesh renderOrder={order}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={materialRef}
          map={outputTexture}
          transparent={true}
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
