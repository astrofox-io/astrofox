// @ts-nocheck
import { useThree } from '@react-three/fiber';
import React from 'react';

const DEFAULT_LIGHT_DISTANCE = 700;

const STUDIO_LIGHTING = {
  keyPosition: [-0.42, 1.4, 0.58],
  fillPosition: [0.8, 0.52, 0.72],
  rimPosition: [-0.78, 0.38, -0.88],
  key: 1,
  fill: 1,
  rim: 1,
};
const PREVIEW_LIGHT_DISTANCE = 520;
const PREVIEW_AMBIENT_INTENSITY = 0.6;
const PREVIEW_KEY_INTENSITY = 1.1;

function scalePosition(position: number[], distance: number) {
  return position.map(value => value * distance);
}

function getDistanceIntensityScale(distance: number) {
  const normalizedDistance = Math.max(50, Number(distance) || DEFAULT_LIGHT_DISTANCE);

  return Math.max(0.4, Math.min(3, Math.sqrt(DEFAULT_LIGHT_DISTANCE / normalizedDistance)));
}

function setVectorPosition(light, position: number[]) {
  if (!light) {
    return;
  }

  const [x, y, z] = position;

  if (light.position.x !== x || light.position.y !== y || light.position.z !== z) {
    light.position.set(x, y, z);
  }
}

function setLightColor(light, color: string) {
  if (!light || !color) {
    return;
  }

  if (light.color.getStyle() !== color) {
    light.color.set(color);
  }
}

function setLightIntensity(light, intensity: number) {
  if (!light) {
    return;
  }

  if (light.intensity !== intensity) {
    light.intensity = intensity;
  }
}

function setCastShadow(light, castShadow: boolean) {
  if (!light) {
    return;
  }

  if (light.castShadow !== castShadow) {
    light.castShadow = castShadow;
  }
}

function syncDirectionalShadow(light, distance: number, width: number, height: number) {
  if (!light?.shadow?.camera) {
    return;
  }

  const viewportWidth = Math.max(1, Number(width) || 1);
  const viewportHeight = Math.max(1, Number(height) || 1);
  const shadowSpanX = Math.max(viewportWidth * 0.85, distance * 0.8);
  const shadowSpanY = Math.max(viewportHeight * 0.85, distance * 0.8);
  const shadowCamera = light.shadow.camera;
  const nextFar = Math.max(distance * 4, 4000);
  let needsProjectionUpdate = false;

  if (shadowCamera.near !== 1) {
    shadowCamera.near = 1;
    needsProjectionUpdate = true;
  }

  if (shadowCamera.far !== nextFar) {
    shadowCamera.far = nextFar;
    needsProjectionUpdate = true;
  }

  if (shadowCamera.left !== -shadowSpanX) {
    shadowCamera.left = -shadowSpanX;
    needsProjectionUpdate = true;
  }

  if (shadowCamera.right !== shadowSpanX) {
    shadowCamera.right = shadowSpanX;
    needsProjectionUpdate = true;
  }

  if (shadowCamera.top !== shadowSpanY) {
    shadowCamera.top = shadowSpanY;
    needsProjectionUpdate = true;
  }

  if (shadowCamera.bottom !== -shadowSpanY) {
    shadowCamera.bottom = -shadowSpanY;
    needsProjectionUpdate = true;
  }

  if (needsProjectionUpdate) {
    shadowCamera.updateProjectionMatrix();
  }
}

function syncSceneLights({
  sceneProperties = {},
  width,
  height,
  previewAmbientLight,
  previewKeyLight,
  keyLight,
  fillLight,
  rimLight,
}) {
  const {
    lighting = false,
    keyLightIntensity = 2.2,
    fillLightIntensity = 0.75,
    rimLightIntensity = 0.35,
    keyLightDistance,
    fillLightDistance,
    rimLightDistance,
    lightDistance = DEFAULT_LIGHT_DISTANCE,
    lightColor = '#FFFFFF',
    fillLightColor = '#FFFFFF',
    rimLightColor = '#F3F1FF',
    shadows = true,
  } = sceneProperties;

  if (!lighting) {
    setLightIntensity(previewAmbientLight, PREVIEW_AMBIENT_INTENSITY);
    setVectorPosition(
      previewKeyLight,
      scalePosition(STUDIO_LIGHTING.keyPosition, PREVIEW_LIGHT_DISTANCE),
    );
    setLightIntensity(previewKeyLight, PREVIEW_KEY_INTENSITY);
    setLightColor(previewKeyLight, '#FFFFFF');
    setCastShadow(previewKeyLight, false);
    setLightIntensity(keyLight, 0);
    setLightIntensity(fillLight, 0);
    setLightIntensity(rimLight, 0);
    setCastShadow(keyLight, false);
    return;
  }

  setLightIntensity(previewAmbientLight, 0);
  setLightIntensity(previewKeyLight, 0);
  setCastShadow(previewKeyLight, false);

  const resolvedKeyDistance = Math.max(50, Number(keyLightDistance ?? lightDistance) || 50);
  const resolvedFillDistance = Math.max(50, Number(fillLightDistance ?? lightDistance) || 50);
  const resolvedRimDistance = Math.max(50, Number(rimLightDistance ?? lightDistance) || 50);

  setVectorPosition(keyLight, scalePosition(STUDIO_LIGHTING.keyPosition, resolvedKeyDistance));
  setLightIntensity(
    keyLight,
    Math.max(0, Number(keyLightIntensity) || 0) *
      STUDIO_LIGHTING.key *
      getDistanceIntensityScale(resolvedKeyDistance),
  );
  setLightColor(keyLight, String(lightColor || '#FFFFFF'));
  setCastShadow(keyLight, Boolean(shadows));
  syncDirectionalShadow(keyLight, resolvedKeyDistance, width, height);

  setVectorPosition(fillLight, scalePosition(STUDIO_LIGHTING.fillPosition, resolvedFillDistance));
  setLightIntensity(
    fillLight,
    Math.max(0, Number(fillLightIntensity) || 0) *
      STUDIO_LIGHTING.fill *
      getDistanceIntensityScale(resolvedFillDistance),
  );
  setLightColor(fillLight, String(fillLightColor || '#FFFFFF'));

  setVectorPosition(rimLight, scalePosition(STUDIO_LIGHTING.rimPosition, resolvedRimDistance));
  setLightIntensity(
    rimLight,
    Math.max(0, Number(rimLightIntensity) || 0) *
      STUDIO_LIGHTING.rim *
      getDistanceIntensityScale(resolvedRimDistance),
  );
  setLightColor(rimLight, String(rimLightColor || '#F3F1FF'));
}

function SceneLights3DImpl({ sceneProperties = {}, width, height }) {
  const previewAmbientRef = React.useRef(null);
  const previewKeyRef = React.useRef(null);
  const keyLightRef = React.useRef(null);
  const fillLightRef = React.useRef(null);
  const rimLightRef = React.useRef(null);
  const invalidate = useThree(state => state.invalidate);

  const lighting = Boolean(sceneProperties.lighting);
  const shadows = Boolean(sceneProperties.shadows ?? true);
  const keyLightIntensity = Number(sceneProperties.keyLightIntensity ?? 2.2);
  const fillLightIntensity = Number(sceneProperties.fillLightIntensity ?? 0.75);
  const rimLightIntensity = Number(sceneProperties.rimLightIntensity ?? 0.35);
  const lightDistance = Number(sceneProperties.lightDistance ?? DEFAULT_LIGHT_DISTANCE);
  const keyLightDistance = Number(sceneProperties.keyLightDistance ?? lightDistance);
  const fillLightDistance = Number(sceneProperties.fillLightDistance ?? lightDistance);
  const rimLightDistance = Number(sceneProperties.rimLightDistance ?? lightDistance);
  const lightColor = String(sceneProperties.lightColor || '#FFFFFF');
  const fillLightColor = String(sceneProperties.fillLightColor || '#FFFFFF');
  const rimLightColor = String(sceneProperties.rimLightColor || '#F3F1FF');

  React.useLayoutEffect(() => {
    syncSceneLights({
      sceneProperties,
      width,
      height,
      previewAmbientLight: previewAmbientRef.current,
      previewKeyLight: previewKeyRef.current,
      keyLight: keyLightRef.current,
      fillLight: fillLightRef.current,
      rimLight: rimLightRef.current,
    });
    invalidate();
  }, [
    fillLightColor,
    fillLightDistance,
    fillLightIntensity,
    height,
    invalidate,
    keyLightDistance,
    keyLightIntensity,
    lightColor,
    lighting,
    rimLightColor,
    rimLightDistance,
    rimLightIntensity,
    sceneProperties,
    shadows,
    width,
  ]);

  return (
    <>
      <ambientLight ref={previewAmbientRef} />
      <directionalLight ref={previewKeyRef} />
      <directionalLight
        ref={keyLightRef}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
      />
      <pointLight ref={fillLightRef} decay={0} />
      <pointLight ref={rimLightRef} decay={0} />
    </>
  );
}

export const SceneLights3D = SceneLights3DImpl;
