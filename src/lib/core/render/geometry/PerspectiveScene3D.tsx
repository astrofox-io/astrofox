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
import { SceneLights3D } from './SceneLights3D';

const PERSPECTIVE_FOV = 50;
const CAMERA_PERSIST_DELAY_MS = 120;

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

export function PerspectiveScene3D({
  sceneId,
  sceneProperties = {},
  cameraModeActive = false,
  width,
  height,
  renderOrder = 0,
  depthOfFieldEffect = null,
  children,
}) {
  const gl = useThree(state => state.gl);
  const dofProperties = depthOfFieldEffect?.properties || {};
  const depthOfFieldEnabled = !!depthOfFieldEffect && depthOfFieldEffect.enabled !== false;
  const cameraAxisScale = React.useMemo(
    () => Math.max(48, Math.min(width, height) * 0.12),
    [height, width],
  );

  const cameraZ = React.useMemo(
    () => height / 2 / Math.tan(((PERSPECTIVE_FOV / 2) * Math.PI) / 180),
    [height],
  );

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
    },
    [perspCamera],
  );

  const persistCameraState = React.useCallback(
    nextState => {
      if (!sceneId) {
        return;
      }

      updateElementProperties(sceneId, {
        cameraAzimuth: nextState.azimuth,
        cameraPolar: nextState.polar,
        cameraDistance: nextState.distance,
      });
    },
    [sceneId],
  );

  React.useEffect(() => {
    perspCamera.aspect = width / height;
    applyCameraState(cameraStateRef.current);
  }, [applyCameraState, perspCamera, width, height, cameraZ]);

  React.useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [gl]);

  React.useEffect(() => {
    cameraAxisHelper.scale.setScalar(cameraAxisScale);
  }, [cameraAxisHelper, cameraAxisScale]);

  React.useEffect(() => {
    if (dragStateRef.current.active) {
      return;
    }

    applyCameraState({
      azimuth: Number(sceneProperties.cameraAzimuth ?? 0),
      polar: clampPolar(Number(sceneProperties.cameraPolar ?? 0)),
      distance: clampDistance(Number(sceneProperties.cameraDistance ?? cameraZ) || cameraZ),
    });
  }, [
    applyCameraState,
    cameraZ,
    clampDistance,
    clampPolar,
    sceneProperties.cameraAzimuth,
    sceneProperties.cameraDistance,
    sceneProperties.cameraPolar,
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

  if (!dofPassRef.current) {
    dofPassRef.current = new ShaderPass(DepthOfFieldShader);
  }

  const dofRenderHeight = React.useMemo(() => {
    const requestedHeight = Math.max(
      1,
      Math.round(Number(dofProperties.height ?? height) || height),
    );

    return Math.min(requestedHeight, Math.max(1, height));
  }, [dofProperties.height, height]);

  const dofRenderWidth = React.useMemo(() => {
    if (height <= 0) {
      return Math.max(1, width);
    }

    return Math.max(1, Math.round((width * dofRenderHeight) / height));
  }, [dofRenderHeight, height, width]);
  const multisampleCount = React.useMemo(() => (gl.capabilities.isWebGL2 ? 4 : 0), [gl]);

  React.useEffect(() => {
    colorTarget.setSize(width, height);
  }, [colorTarget, width, height]);

  React.useEffect(() => {
    colorTarget.samples = multisampleCount;
    effectTarget.samples = multisampleCount;
  }, [colorTarget, effectTarget, multisampleCount]);

  React.useEffect(() => {
    effectTarget.setSize(
      depthOfFieldEnabled ? dofRenderWidth : width,
      depthOfFieldEnabled ? dofRenderHeight : height,
    );
    dofPassRef.current?.setSize(
      depthOfFieldEnabled ? dofRenderWidth : width,
      depthOfFieldEnabled ? dofRenderHeight : height,
    );
  }, [depthOfFieldEnabled, dofRenderHeight, dofRenderWidth, effectTarget, height, width]);

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
  const sceneChildren = React.useMemo(
    () =>
      React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { sceneCamera: perspCamera })
          : child,
      ),
    [children, perspCamera],
  );

  React.useEffect(() => {
    const material = materialRef.current;
    if (!material) {
      return;
    }

    material.map = outputTexture;
    material.needsUpdate = true;
  }, [outputTexture]);

  useFrame(() => {
    const prevClearAlpha = gl.getClearAlpha();
    gl.setClearAlpha(0);
    gl.setRenderTarget(colorTarget);
    gl.clear();
    gl.render(perspScene, perspCamera);

    if (depthOfFieldEnabled && colorTarget.depthTexture) {
      dofPassRef.current?.setUniforms({
        depthTexture: colorTarget.depthTexture,
        nearClip: perspCamera.near,
        farClip: perspCamera.far,
        focusDistance: Number(dofProperties.focusDistance ?? 0),
        focalLength: Number(dofProperties.focalLength ?? 0.02),
        bokehScale: Number(dofProperties.bokehScale ?? 2),
        resolutionScale: dofRenderHeight / Math.max(1, height),
      });
      dofPassRef.current?.render(gl, colorTarget, effectTarget);
    }

    gl.setRenderTarget(null);
    gl.setClearAlpha(prevClearAlpha);
  }, -2);

  return (
    <>
      {createPortal(
        <>
          <SceneLights3D sceneProperties={sceneProperties} width={width} height={height} />
          {sceneChildren}
          {cameraModeActive ? <primitive object={cameraAxisHelper} /> : null}
        </>,
        perspScene,
      )}
      <mesh renderOrder={renderOrder}>
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
