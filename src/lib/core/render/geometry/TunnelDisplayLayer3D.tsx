// @ts-nocheck

import { useFrame } from '@react-three/fiber';
import React from 'react';
import {
  AddEquation,
  BackSide,
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  CustomBlending,
  Matrix4,
  OneFactor,
  Quaternion,
  TubeGeometry,
  Vector3,
  ZeroFactor,
} from 'three';
import { clamp } from '@/lib/utils/math';
import { getThreeBlending, requiresPremultipliedAlpha } from '../layers/TexturePlane';
import { useDisplay3D } from './Display3DLayer';

const FOV = 50;

const TUNNEL_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const TUNNEL_FRAGMENT_SHADER = `
uniform float uTime;
uniform float uTravelSpeed;
uniform float uColumns;
uniform float uRows;
uniform float uLineWidth;
uniform float uOpacity;
uniform float uTransparentSurface;
uniform float uFogDistance;
uniform vec3 uLineColor;
uniform vec3 uBackgroundColor;

varying vec2 vUv;

float gridLine(float value, float width) {
	float distanceToLine = min(value, 1.0 - value);
	return 1.0 - smoothstep(0.0, width, distanceToLine);
}

void main() {
	float scroll = fract(vUv.x * uRows + uTime * uTravelSpeed);
	float column = fract(vUv.y * uColumns);
	float rowMask = gridLine(scroll, uLineWidth);
	float columnMask = gridLine(column, uLineWidth);
	float grid = max(rowMask, columnMask);
	float glow = max(
		gridLine(scroll, uLineWidth * 2.5),
		gridLine(column, uLineWidth * 2.5)
	);
	float fog = 1.0;
	if (uFogDistance > 0.0) {
		fog = smoothstep(0.0, uFogDistance, vUv.x);
	}

	float lineMix = clamp(glow * 0.35 + grid * 0.65, 0.0, 1.0);
	vec3 color = mix(uBackgroundColor, uLineColor, lineMix);
	color = mix(color, uBackgroundColor, fog);
	float alpha = mix(1.0, lineMix, uTransparentSurface);
	alpha *= mix(1.0, 1.0 - fog, uTransparentSurface);
	gl_FragColor = vec4(color, alpha * uOpacity);
}
`;

// Pre-allocated temp vectors for curve computation (avoids per-frame allocations)
const _worldPoint = new Vector3();
const _cameraPoint = new Vector3();
const _nextPoint = new Vector3();
const _tangent = new Vector3();
const _right = new Vector3();
const _up = new Vector3();
const _relative = new Vector3();
const _bankQuat = new Quaternion();
const _curveP = new Vector3();
const _normal = new Vector3();
const _rotationAxis = new Vector3();
const _cameraWorldPosition = new Vector3();
const _cameraLookMatrix = new Matrix4();
const _fogColor = new Color();
const DEFAULT_CAMERA_AZIMUTH = (45 * Math.PI) / 180;
const DEFAULT_CAMERA_POLAR = (30 * Math.PI) / 180;

function ensureVectorArraySize(vectors, size: number) {
  while (vectors.length < size) {
    vectors.push(new Vector3());
  }
  vectors.length = size;
  return vectors;
}

function initializeTransportNormal(out: Vector3, tangent: Vector3, previousNormal?: Vector3) {
  if (previousNormal && previousNormal.lengthSq() > 1e-6) {
    out.copy(previousNormal);
    out.addScaledVector(tangent, -out.dot(tangent));
    if (out.lengthSq() > 1e-6) {
      out.normalize();
      return out;
    }
  }

  out.set(0, 1, 0);
  if (Math.abs(tangent.y) > 0.9) {
    out.set(1, 0, 0);
  }

  out.addScaledVector(tangent, -out.dot(tangent));
  if (out.lengthSq() < 1e-6) {
    out.set(0, 0, 1);
    out.addScaledVector(tangent, -out.dot(tangent));
  }

  out.normalize();
  return out;
}

function computeWorldPoint(
  out: Vector3,
  distance: number,
  tunnelDepth: number,
  curveTurns: number,
  curveBend: number,
  curveTime: number,
) {
  const primaryAngle = (distance / tunnelDepth) * curveTurns * Math.PI * 2 + curveTime * 0.45;
  const secondaryAngle = (distance / tunnelDepth) * curveTurns * Math.PI * 4.4 - curveTime * 0.28;

  out.set(
    Math.sin(primaryAngle) * curveBend + Math.sin(secondaryAngle) * curveBend * 0.3,
    Math.cos(primaryAngle * 0.82 + 0.6) * curveBend * 0.72 +
      Math.cos(secondaryAngle * 0.7 - 0.35) * curveBend * 0.22,
    -distance,
  );
  return out;
}

function updateTubeVertices(
  geometry,
  curve: CatmullRomCurve3,
  tubularSegments: number,
  radius: number,
  radialSegments: number,
  frameTangents,
  frameNormals,
  frameBinormals,
  previousNormal,
) {
  const posAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  const sampleCount = tubularSegments + 1;

  ensureVectorArraySize(frameTangents, sampleCount);
  ensureVectorArraySize(frameNormals, sampleCount);
  ensureVectorArraySize(frameBinormals, sampleCount);

  for (let i = 0; i <= tubularSegments; i++) {
    curve.getTangentAt(i / tubularSegments, frameTangents[i]);
    frameTangents[i].normalize();

    if (i === 0) {
      initializeTransportNormal(frameNormals[i], frameTangents[i], previousNormal);
      frameBinormals[i].crossVectors(frameTangents[i], frameNormals[i]).normalize();
      frameNormals[i].crossVectors(frameBinormals[i], frameTangents[i]).normalize();
      continue;
    }

    _rotationAxis.crossVectors(frameTangents[i - 1], frameTangents[i]);

    if (_rotationAxis.lengthSq() > 1e-8) {
      _rotationAxis.normalize();
      const angle = Math.acos(
        Math.min(1, Math.max(-1, frameTangents[i - 1].dot(frameTangents[i]))),
      );
      frameNormals[i].copy(frameNormals[i - 1]).applyAxisAngle(_rotationAxis, angle);
    } else {
      frameNormals[i].copy(frameNormals[i - 1]);
    }

    frameNormals[i].addScaledVector(frameTangents[i], -frameNormals[i].dot(frameTangents[i]));
    if (frameNormals[i].lengthSq() < 1e-6) {
      initializeTransportNormal(frameNormals[i], frameTangents[i], frameNormals[i - 1]);
    } else {
      frameNormals[i].normalize();
    }

    frameBinormals[i].crossVectors(frameTangents[i], frameNormals[i]).normalize();
    frameNormals[i].crossVectors(frameBinormals[i], frameTangents[i]).normalize();
  }

  if (previousNormal) {
    previousNormal.copy(frameNormals[0]);
  }

  let idx = 0;
  for (let i = 0; i <= tubularSegments; i++) {
    curve.getPointAt(i / tubularSegments, _curveP);
    const N = frameNormals[i];
    const B = frameBinormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      _normal.x = cos * N.x + sin * B.x;
      _normal.y = cos * N.y + sin * B.y;
      _normal.z = cos * N.z + sin * B.z;
      _normal.normalize();

      normalAttr.setXYZ(idx, _normal.x, _normal.y, _normal.z);
      posAttr.setXYZ(
        idx,
        _curveP.x + radius * _normal.x,
        _curveP.y + radius * _normal.y,
        _curveP.z + radius * _normal.z,
      );

      idx++;
    }
  }

  posAttr.needsUpdate = true;
  normalAttr.needsUpdate = true;
  geometry.computeBoundingSphere();
}

function updateTubeFogColors(
  geometry,
  tubularSegments: number,
  radialSegments: number,
  lineColor: Color,
  backgroundColor: Color,
  fogDistanceNormalized: number,
) {
  const posAttr = geometry.getAttribute('position');
  let colorAttr = geometry.getAttribute('color');

  if (!colorAttr || colorAttr.count !== posAttr.count) {
    colorAttr = new BufferAttribute(new Float32Array(posAttr.count * 3), 3);
    geometry.setAttribute('color', colorAttr);
  }

  let idx = 0;
  for (let i = 0; i <= tubularSegments; i++) {
    const progress = tubularSegments > 0 ? i / tubularSegments : 0;
    const fog =
      fogDistanceNormalized > 0
        ? clamp(progress / fogDistanceNormalized, 0, 1) ** 2 *
          (3 - 2 * clamp(progress / fogDistanceNormalized, 0, 1))
        : 1;
    _fogColor.copy(lineColor).lerp(backgroundColor, fog);

    for (let j = 0; j <= radialSegments; j++) {
      colorAttr.setXYZ(idx, _fogColor.r, _fogColor.g, _fogColor.b);
      idx++;
    }
  }

  colorAttr.needsUpdate = true;
}

export function TunnelDisplayLayer3D({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
}) {
  const { camera: sceneCamera, height } = useDisplay3D();
  const { properties = {} } = display;
  const {
    color = '#D6ECFF',
    backgroundColor = '#02060A',
    opacity = 1,
    radius = 180,
    depth = 3200,
    fogDistance = 2400,
    curvature = 32,
    turnRate = 2.6,
    travelSpeed = 0.8,
    turnSpeed = 0.8,
    bank = 8,
    gridColumns = 28,
    gridRows = 48,
    lineWidth = 0.05,
    transparentSurface = false,
    shader = false,
    radialSegments = 40,
    lengthSegments = 128,
  } = properties;

  const timeRef = React.useRef(0);
  const shaderMaterialRef = React.useRef(null);
  const surfaceMeshRef = React.useRef(null);
  const lineMeshRef = React.useRef(null);
  const groupRef = React.useRef(null);
  const surfaceGeometryRef = React.useRef(null);
  const lineGeometryRef = React.useRef(null);
  const surfaceCurvePointsRef = React.useRef([]);
  const lineCurvePointsRef = React.useRef([]);
  const surfaceFrameTangentsRef = React.useRef([]);
  const surfaceFrameNormalsRef = React.useRef([]);
  const surfaceFrameBinormalsRef = React.useRef([]);
  const surfaceInitialFrameNormalRef = React.useRef(new Vector3(0, 1, 0));
  const lineFrameTangentsRef = React.useRef([]);
  const lineFrameNormalsRef = React.useRef([]);
  const lineFrameBinormalsRef = React.useRef([]);
  const lineInitialFrameNormalRef = React.useRef(new Vector3(0, 1, 0));
  const fallbackGroupQuaternionRef = React.useRef(new Quaternion());
  const surfaceStructuralKeyRef = React.useRef('');
  const lineStructuralKeyRef = React.useRef('');
  const deltaSeconds = Math.max(0, Number(frameData?.delta ?? 16.667)) / 1000;

  if (frameData?.hasUpdate) {
    timeRef.current += deltaSeconds;
  }

  const tunnelRadius = Math.max(40, Number(radius) || 0);
  const tunnelDepth = Math.max(600, Number(depth) || 0);
  const curveBend = Math.max(0, Number(curvature) || 0);
  const curveTurns = Math.max(0.1, Number(turnRate) || 0);
  const lineColumns = Math.max(6, Math.round(Number(gridColumns) || 0));
  const lineRows = Math.max(6, Math.round(Number(gridRows) || 0));
  const radialDetail = Math.max(8, Math.round(Number(radialSegments) || 0));
  const lengthDetail = Math.max(16, Math.round(Number(lengthSegments) || 0));
  const pathSamples = Math.max(24, Math.round(Math.max(lengthDetail, lineRows) / 2));
  const leadDistance = Math.min(240, tunnelDepth * 0.06 + 100);
  const trailDistance = Math.min(760, tunnelDepth * 0.24 + 360);
  const curveTime = timeRef.current * Number(turnSpeed || 0);
  const fallbackCameraDistance =
    Number(height || 0) > 0 ? Number(height) / 2 / Math.tan(((FOV / 2) * Math.PI) / 180) : 0;
  const cameraAzimuth = Number(properties.cameraAzimuth ?? DEFAULT_CAMERA_AZIMUTH);
  const cameraPolar = clamp(
    Number(properties.cameraPolar ?? DEFAULT_CAMERA_POLAR),
    -Math.PI / 2 + 0.05,
    Math.PI / 2 - 0.05,
  );
  const cameraDistance = Math.max(
    50,
    Math.min(
      5000,
      Number(properties.cameraDistance ?? fallbackCameraDistance) || fallbackCameraDistance,
    ),
  );
  const cameraCosPolar = Math.cos(cameraPolar);
  const groupPosition = [
    Math.sin(cameraAzimuth) * cameraCosPolar * cameraDistance,
    Math.sin(cameraPolar) * cameraDistance,
    Math.cos(cameraAzimuth) * cameraCosPolar * cameraDistance,
  ];
  const finalOpacity = clamp(Number(opacity ?? 1) * Number(sceneOpacity ?? 1), 0, 1);
  const shaderEnabled = Boolean(shader);
  const resolvedLineColor = sceneMask ? '#000000' : color;
  const resolvedBackgroundColor = sceneMask ? '#000000' : backgroundColor;
  const lineColorValue = React.useMemo(() => new Color(resolvedLineColor), [resolvedLineColor]);
  const backgroundColorValue = React.useMemo(
    () => new Color(resolvedBackgroundColor),
    [resolvedBackgroundColor],
  );
  const blending = sceneMask ? CustomBlending : getThreeBlending(sceneBlendMode);
  const rollRadians = ((Number(bank) || 0) * Math.PI) / 180;
  const visiblePathDistance = tunnelDepth + leadDistance + trailDistance;
  const lineRowSpacing = visiblePathDistance / Math.max(1, lineRows);
  const normalizedTravelPhase = (((timeRef.current * Number(travelSpeed || 0) * 1.2) % 1) + 1) % 1;
  const lineDistanceOffset = shaderEnabled ? 0 : -normalizedTravelPhase * lineRowSpacing;
  _cameraWorldPosition.set(groupPosition[0], groupPosition[1], groupPosition[2]);
  _cameraLookMatrix.lookAt(_cameraWorldPosition, _worldPoint.set(0, 0, 0), _up.set(0, 1, 0));
  fallbackGroupQuaternionRef.current.setFromRotationMatrix(_cameraLookMatrix);
  const shaderUniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uTravelSpeed: { value: 0 },
      uColumns: { value: 0 },
      uRows: { value: 0 },
      uLineWidth: { value: 0 },
      uOpacity: { value: 1 },
      uTransparentSurface: { value: 0 },
      uFogDistance: { value: 1 },
      uLineColor: { value: new Color() },
      uBackgroundColor: { value: new Color() },
    }),
    [],
  );

  // Ensure we have enough pre-allocated Vector3s for curve points
  const numPoints = pathSamples + 1;
  const surfacePoints = surfaceCurvePointsRef.current;
  while (surfacePoints.length < numPoints) {
    surfacePoints.push(new Vector3());
  }
  surfacePoints.length = numPoints;
  const linePoints = lineCurvePointsRef.current;
  while (linePoints.length < numPoints) {
    linePoints.push(new Vector3());
  }
  linePoints.length = numPoints;

  // Compute curve points in-place (reusing pre-allocated Vector3s)
  const sampleStep = 10;
  const currentDistance = curveTime * 320;

  computeWorldPoint(_cameraPoint, currentDistance, tunnelDepth, curveTurns, curveBend, curveTime);
  computeWorldPoint(
    _nextPoint,
    currentDistance + sampleStep,
    tunnelDepth,
    curveTurns,
    curveBend,
    curveTime,
  );
  _tangent.subVectors(_nextPoint, _cameraPoint).normalize();
  _right.crossVectors(_up.set(0, 1, 0), _tangent);
  if (_right.lengthSq() < 1e-6) {
    _right.set(1, 0, 0);
  }
  _right.normalize();
  _up.crossVectors(_tangent, _right).normalize();
  _bankQuat.setFromAxisAngle(_tangent, rollRadians);
  _right.applyQuaternion(_bankQuat);
  _up.applyQuaternion(_bankQuat);

  for (let i = 0; i <= pathSamples; i++) {
    const t = i / pathSamples;
    const distance =
      currentDistance - trailDistance + t * (tunnelDepth + leadDistance + trailDistance);
    computeWorldPoint(_worldPoint, distance, tunnelDepth, curveTurns, curveBend, curveTime);
    _relative.subVectors(_worldPoint, _cameraPoint);
    surfacePoints[i].set(_relative.dot(_right), _relative.dot(_up), -_relative.dot(_tangent));
  }

  const surfaceCurve = new CatmullRomCurve3(surfacePoints);
  let lineCurve = surfaceCurve;
  if (!shaderEnabled) {
    for (let i = 0; i <= pathSamples; i++) {
      const t = i / pathSamples;
      const distance =
        currentDistance + lineDistanceOffset - trailDistance + t * visiblePathDistance;
      computeWorldPoint(_worldPoint, distance, tunnelDepth, curveTurns, curveBend, curveTime);
      _relative.subVectors(_worldPoint, _cameraPoint);
      linePoints[i].set(_relative.dot(_right), _relative.dot(_up), -_relative.dot(_tangent));
    }
    lineCurve = new CatmullRomCurve3(linePoints);
  }

  shaderUniforms.uTime.value = timeRef.current;
  shaderUniforms.uTravelSpeed.value = Number(travelSpeed || 0) * 1.2;
  shaderUniforms.uColumns.value = Math.max(1, Number(gridColumns) || 1);
  shaderUniforms.uRows.value = Math.max(1, Number(gridRows) || 1);
  shaderUniforms.uLineWidth.value = clamp(Number(lineWidth) || 0, 0.005, 0.3);
  shaderUniforms.uOpacity.value = finalOpacity;
  shaderUniforms.uTransparentSurface.value = transparentSurface ? 1 : 0;
  shaderUniforms.uFogDistance.value = clamp(
    Number(fogDistance ?? tunnelDepth) / Math.max(1, tunnelDepth),
    0,
    1,
  );
  shaderUniforms.uLineColor.value.set(resolvedLineColor);
  shaderUniforms.uBackgroundColor.value.set(resolvedBackgroundColor);

  // R3F copies the `uniforms` prop into the material's own uniform objects on
  // mount and does not re-read it (same reference), so scalar changes made on
  // shaderUniforms never reach the GPU. Mirror the values onto the live
  // material every commit.
  React.useLayoutEffect(() => {
    const material = shaderMaterialRef.current;
    if (!material?.uniforms) {
      return;
    }
    for (const name of Object.keys(shaderUniforms)) {
      const target = material.uniforms[name];
      if (target && target.value !== shaderUniforms[name].value) {
        target.value = shaderUniforms[name].value;
      }
    }
  });

  const surfaceStructuralKey = `${lengthDetail}-${radialDetail}`;
  if (surfaceStructuralKeyRef.current !== surfaceStructuralKey) {
    if (surfaceGeometryRef.current) surfaceGeometryRef.current.dispose();
    surfaceGeometryRef.current = new TubeGeometry(
      surfaceCurve,
      lengthDetail,
      tunnelRadius,
      radialDetail,
      false,
    );
    surfaceStructuralKeyRef.current = surfaceStructuralKey;
    if (surfaceMeshRef.current) {
      surfaceMeshRef.current.geometry = surfaceGeometryRef.current;
    }
    updateTubeVertices(
      surfaceGeometryRef.current,
      surfaceCurve,
      lengthDetail,
      tunnelRadius,
      radialDetail,
      surfaceFrameTangentsRef.current,
      surfaceFrameNormalsRef.current,
      surfaceFrameBinormalsRef.current,
      surfaceInitialFrameNormalRef.current,
    );
  } else if (surfaceGeometryRef.current) {
    updateTubeVertices(
      surfaceGeometryRef.current,
      surfaceCurve,
      lengthDetail,
      tunnelRadius,
      radialDetail,
      surfaceFrameTangentsRef.current,
      surfaceFrameNormalsRef.current,
      surfaceFrameBinormalsRef.current,
      surfaceInitialFrameNormalRef.current,
    );
  }

  const lineStructuralKey = `${lineRows}-${lineColumns}`;
  if (lineStructuralKeyRef.current !== lineStructuralKey) {
    if (lineGeometryRef.current) lineGeometryRef.current.dispose();
    lineGeometryRef.current = new TubeGeometry(
      lineCurve,
      lineRows,
      tunnelRadius,
      lineColumns,
      false,
    );
    lineStructuralKeyRef.current = lineStructuralKey;
    if (lineMeshRef.current) {
      lineMeshRef.current.geometry = lineGeometryRef.current;
    }
    updateTubeVertices(
      lineGeometryRef.current,
      lineCurve,
      lineRows,
      tunnelRadius,
      lineColumns,
      lineFrameTangentsRef.current,
      lineFrameNormalsRef.current,
      lineFrameBinormalsRef.current,
      lineInitialFrameNormalRef.current,
    );
    updateTubeFogColors(
      lineGeometryRef.current,
      lineRows,
      lineColumns,
      lineColorValue,
      backgroundColorValue,
      shaderUniforms.uFogDistance.value,
    );
  } else if (lineGeometryRef.current) {
    updateTubeVertices(
      lineGeometryRef.current,
      lineCurve,
      lineRows,
      tunnelRadius,
      lineColumns,
      lineFrameTangentsRef.current,
      lineFrameNormalsRef.current,
      lineFrameBinormalsRef.current,
      lineInitialFrameNormalRef.current,
    );
    updateTubeFogColors(
      lineGeometryRef.current,
      lineRows,
      lineColumns,
      lineColorValue,
      backgroundColorValue,
      shaderUniforms.uFogDistance.value,
    );
  }

  // Dispose geometry on unmount
  React.useEffect(() => {
    return () => {
      if (surfaceGeometryRef.current) {
        surfaceGeometryRef.current.dispose();
        surfaceGeometryRef.current = null;
      }
      if (lineGeometryRef.current) {
        lineGeometryRef.current.dispose();
        lineGeometryRef.current = null;
      }
    };
  }, []);

  // Assign geometry on first mount
  React.useEffect(() => {
    if (surfaceMeshRef.current && surfaceGeometryRef.current) {
      surfaceMeshRef.current.geometry = surfaceGeometryRef.current;
    }
    if (lineMeshRef.current && lineGeometryRef.current) {
      lineMeshRef.current.geometry = lineGeometryRef.current;
    }
  });
  useFrame(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    if (sceneCamera) {
      group.position.copy(sceneCamera.position);
      group.quaternion.copy(sceneCamera.quaternion);
      return;
    }

    group.position.set(groupPosition[0], groupPosition[1], groupPosition[2]);
    group.quaternion.copy(fallbackGroupQuaternionRef.current);
  });

  return (
    <group
      ref={groupRef}
      position={groupPosition}
      quaternion={fallbackGroupQuaternionRef.current}
      scale={[1, 1, 1]}
    >
      <mesh ref={surfaceMeshRef} renderOrder={order} frustumCulled={false} visible={!shaderEnabled}>
        <meshStandardMaterial
          color={resolvedBackgroundColor}
          transparent={true}
          side={BackSide}
          roughness={0.85}
          metalness={0.02}
          depthTest={true}
          depthWrite={!transparentSurface && finalOpacity > 0}
          opacity={transparentSurface ? 0 : finalOpacity}
          premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
          blending={blending}
          blendEquation={sceneMask ? AddEquation : undefined}
          blendSrc={sceneMask ? ZeroFactor : undefined}
          blendDst={sceneMask ? OneFactor : undefined}
          blendEquationAlpha={sceneMask ? AddEquation : undefined}
          blendSrcAlpha={sceneMask ? OneFactor : undefined}
          blendDstAlpha={sceneMask ? ZeroFactor : undefined}
        />
      </mesh>
      <mesh
        ref={lineMeshRef}
        renderOrder={order + 0.01}
        frustumCulled={false}
        visible={!shaderEnabled}
      >
        <meshStandardMaterial
          color={resolvedLineColor}
          vertexColors={true}
          wireframe={true}
          wireframeLinewidth={Math.max(1, clamp(Number(lineWidth) || 0, 0.005, 0.3) * 100)}
          transparent={true}
          side={BackSide}
          roughness={0.55}
          metalness={0.04}
          depthTest={true}
          depthWrite={false}
          opacity={finalOpacity}
          premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
          blending={blending}
          blendEquation={sceneMask ? AddEquation : undefined}
          blendSrc={sceneMask ? ZeroFactor : undefined}
          blendDst={sceneMask ? OneFactor : undefined}
          blendEquationAlpha={sceneMask ? AddEquation : undefined}
          blendSrcAlpha={sceneMask ? OneFactor : undefined}
          blendDstAlpha={sceneMask ? ZeroFactor : undefined}
        />
      </mesh>
      <mesh
        renderOrder={order}
        frustumCulled={false}
        visible={shaderEnabled}
        geometry={surfaceGeometryRef.current || undefined}
      >
        <shaderMaterial
          ref={shaderMaterialRef}
          uniforms={shaderUniforms}
          vertexShader={TUNNEL_VERTEX_SHADER}
          fragmentShader={TUNNEL_FRAGMENT_SHADER}
          transparent={true}
          side={BackSide}
          depthTest={true}
          depthWrite={!transparentSurface}
          premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
          blending={blending}
          blendEquation={sceneMask ? AddEquation : undefined}
          blendSrc={sceneMask ? ZeroFactor : undefined}
          blendDst={sceneMask ? OneFactor : undefined}
          blendEquationAlpha={sceneMask ? AddEquation : undefined}
          blendSrcAlpha={sceneMask ? OneFactor : undefined}
          blendDstAlpha={sceneMask ? ZeroFactor : undefined}
        />
      </mesh>
    </group>
  );
}
