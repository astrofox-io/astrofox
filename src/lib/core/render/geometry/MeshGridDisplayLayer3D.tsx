// @ts-nocheck

import { useFrame } from '@react-three/fiber';
import React from 'react';
import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  DoubleSide,
  DynamicDrawUsage,
  FrontSide,
  OneFactor,
  ZeroFactor,
} from 'three';
import { clamp } from '@/lib/utils/math';
import { getThreeBlending, requiresPremultipliedAlpha } from '../layers/TexturePlane';
import { getMaterialNode, isPointsMaterial } from './GeometryDisplayLayer';
import { createGridMotionContext, sampleProceduralGridMotion } from './gridMotion';
import { useTexture3D } from './useTexture3D';

function createMeshGridGeometry(columns: number, rows: number, separation: number) {
  const vertexCount = columns * rows;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint16Array((columns - 1) * (rows - 1) * 6);
  const halfWidth = ((columns - 1) * separation) / 2;
  const halfDepth = ((rows - 1) * separation) / 2;

  let positionIndex = 0;
  let uvIndex = 0;
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      positions[positionIndex] = columnIndex * separation - halfWidth;
      positions[positionIndex + 1] = 0;
      positions[positionIndex + 2] = rowIndex * separation - halfDepth;
      normals[positionIndex] = 0;
      normals[positionIndex + 1] = 1;
      normals[positionIndex + 2] = 0;
      uvs[uvIndex] = columns <= 1 ? 0 : columnIndex / (columns - 1);
      uvs[uvIndex + 1] = rows <= 1 ? 0 : rowIndex / (rows - 1);

      positionIndex += 3;
      uvIndex += 2;
    }
  }

  let indexOffset = 0;
  for (let rowIndex = 0; rowIndex < rows - 1; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns - 1; columnIndex += 1) {
      const topLeft = rowIndex * columns + columnIndex;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns;
      const bottomRight = bottomLeft + 1;

      indices[indexOffset] = topLeft;
      indices[indexOffset + 1] = bottomLeft;
      indices[indexOffset + 2] = topRight;
      indices[indexOffset + 3] = topRight;
      indices[indexOffset + 4] = bottomLeft;
      indices[indexOffset + 5] = bottomRight;
      indexOffset += 6;
    }
  }

  const geometry = new BufferGeometry();
  const positionAttribute = new BufferAttribute(positions, 3);
  const normalAttribute = new BufferAttribute(normals, 3);

  positionAttribute.setUsage(DynamicDrawUsage);
  normalAttribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('normal', normalAttribute);
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  return {
    geometry,
    positions,
    positionAttribute,
    normalAttribute: geometry.getAttribute('normal'),
  };
}

export function MeshGridDisplayLayer3D({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
}) {
  const { properties = {} } = display;
  const {
    material = 'Points',
    shading = 'Smooth',
    motion = 'Horizontal',
    color = '#FFFFFF',
    edges = false,
    edgeColor = '#FFFFFF',
    wireframe = false,
    x = 0,
    y = 0,
    z = 0,
    columns = 42,
    rows = 32,
    separation = 32,
    height = 28,
    pointSize = 4,
    speed = 1,
    frequencyX = 0.3,
    frequencyY = 0.5,
    opacity = 1,
    texture: textureSrc = '',
  } = properties;

  const textureMap = useTexture3D(textureSrc || undefined);

  const gridColumns = Math.max(4, Math.round(Number(columns) || 4));
  const gridRows = Math.max(4, Math.round(Number(rows) || 4));
  const gridSeparation = Math.max(8, Number(separation) || 8);
  const pointsMaterial = isPointsMaterial(material);
  const finalOpacity = clamp(Number(opacity ?? 1) * Number(sceneOpacity ?? 1), 0, 1);
  const blending = sceneMask ? CustomBlending : getThreeBlending(sceneBlendMode);
  const geometryColor = sceneMask ? '#000000' : color;
  const edgeOpacity = sceneMask ? Number(sceneInverse ? 1 : 0) : 0.9 * Number(sceneOpacity ?? 1);
  const premultipliedAlpha = requiresPremultipliedAlpha(sceneBlendMode);
  const geometryData = React.useMemo(
    () => createMeshGridGeometry(gridColumns, gridRows, gridSeparation),
    [gridColumns, gridRows, gridSeparation],
  );
  const timeRef = React.useRef(0);
  const meshPosition = [Number(x) || 0, -(Number(y) || 0), Number(z) || 0];
  const GeometryPrimitive = pointsMaterial ? 'points' : 'mesh';
  const geometryMaterialProps = pointsMaterial
    ? {
        color: geometryColor,
        opacity: finalOpacity,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        premultipliedAlpha,
        blending,
        blendEquation: sceneMask ? AddEquation : undefined,
        blendSrc: sceneMask ? ZeroFactor : undefined,
        blendDst: sceneMask ? OneFactor : undefined,
        blendEquationAlpha: sceneMask ? AddEquation : undefined,
        blendSrcAlpha: sceneMask ? OneFactor : undefined,
        blendDstAlpha: sceneMask ? ZeroFactor : undefined,
        size: Math.max(0.5, Number(pointSize) || 0.5),
        sizeAttenuation: true,
      }
    : {
        flatShading: shading === 'Flat',
        color: geometryColor,
        opacity: finalOpacity,
        wireframe,
        transparent: true,
        side: material === 'Basic' ? FrontSide : DoubleSide,
        depthTest: true,
        depthWrite: true,
        premultipliedAlpha,
        blending,
        blendEquation: sceneMask ? AddEquation : undefined,
        blendSrc: sceneMask ? ZeroFactor : undefined,
        blendDst: sceneMask ? OneFactor : undefined,
        blendEquationAlpha: sceneMask ? AddEquation : undefined,
        blendSrcAlpha: sceneMask ? OneFactor : undefined,
        blendDstAlpha: sceneMask ? ZeroFactor : undefined,
        ...(textureMap ? { map: textureMap } : {}),
      };

  React.useEffect(() => {
    return () => {
      geometryData.geometry.dispose();
    };
  }, [geometryData.geometry]);

  useFrame(() => {
    const deltaSeconds = frameData?.hasUpdate
      ? Math.max(0, Number(frameData?.delta ?? 16.667)) / 1000
      : 0;
    const motionSpeed = Math.max(0, Number(speed) || 0);
    const amplitude = Math.max(0, Number(height) || 0);
    const resolvedFrequencyX = Math.max(0.05, Number(frequencyX) || 0.05);
    const resolvedFrequencyY = Math.max(0.05, Number(frequencyY) || 0.05);
    const { geometry, positions, positionAttribute } = geometryData;

    timeRef.current += deltaSeconds * motionSpeed;

    let positionIndex = 0;
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < gridColumns; columnIndex += 1) {
        const motionContext = createGridMotionContext(
          columnIndex,
          rowIndex,
          gridColumns,
          gridRows,
          timeRef.current,
          resolvedFrequencyX,
          resolvedFrequencyY,
        );
        positions[positionIndex + 1] = sampleProceduralGridMotion(
          String(motion || 'Horizontal'),
          motionContext,
          amplitude,
        );
        positionIndex += 3;
      }
    }

    positionAttribute.needsUpdate = true;
    if (!pointsMaterial) {
      geometry.computeVertexNormals();
      geometryData.normalAttribute.needsUpdate = true;
    }
  });

  return (
    <group>
      <GeometryPrimitive
        key="mesh-grid"
        geometry={geometryData.geometry}
        position={meshPosition}
        renderOrder={order}
        frustumCulled={false}
      >
        {getMaterialNode(material, geometryMaterialProps)}
      </GeometryPrimitive>
      {edges && !pointsMaterial && (
        <mesh
          key="edge-overlay"
          geometry={geometryData.geometry}
          position={meshPosition}
          renderOrder={order + 0.01}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={sceneMask ? '#000000' : edgeColor}
            wireframe={true}
            transparent={true}
            roughness={0.7}
            metalness={0.03}
            premultipliedAlpha={premultipliedAlpha}
            opacity={edgeOpacity}
            depthTest={true}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            blending={blending}
            blendEquation={sceneMask ? AddEquation : undefined}
            blendSrc={sceneMask ? ZeroFactor : undefined}
            blendDst={sceneMask ? OneFactor : undefined}
            blendEquationAlpha={sceneMask ? AddEquation : undefined}
            blendSrcAlpha={sceneMask ? OneFactor : undefined}
            blendDstAlpha={sceneMask ? ZeroFactor : undefined}
          />
        </mesh>
      )}
    </group>
  );
}
