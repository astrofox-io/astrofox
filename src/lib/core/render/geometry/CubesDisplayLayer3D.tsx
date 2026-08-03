// @ts-nocheck
import React from 'react';
import {
  AddEquation,
  BoxGeometry,
  Color,
  CustomBlending,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  OneFactor,
  ZeroFactor,
} from 'three';
import { getThreeBlending, requiresPremultipliedAlpha } from '../layers/TexturePlane';
import { createGridMotionContext, sampleProceduralGridMotion } from './gridMotion';
import { useTexture3D } from './useTexture3D';

const DEPTH_BASE_RATIO = 0.1;
const DEPTH_MAX_RATIO = 3.6;
const EDGE_SEGMENT_COUNT = 12;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getColorLuminance(color: Color) {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

function getLiftedSurfaceColor(colorValue: string) {
  const color = new Color(colorValue);
  const luminance = getColorLuminance(color);

  if (luminance >= 0.12) {
    return color;
  }

  // Very dark albedo values read as "lighting is broken" on standard materials.
  // Lift them toward a dark neutral so scene light color and intensity remain visible.
  return color.lerp(new Color('#383838'), clamp((0.12 - luminance) / 0.12, 0, 1));
}

function getCubeEdgeThickness(size: number, depth: number) {
  return clamp(Math.min(size, depth) * 0.08, 0.8, 3.5);
}

function setInstanceTransform(
  mesh,
  object: Object3D,
  index: number,
  x: number,
  y: number,
  z: number,
  scaleX: number,
  scaleY: number,
  scaleZ: number,
) {
  object.position.set(x, y, z);
  object.scale.set(scaleX, scaleY, scaleZ);
  object.updateMatrix();
  mesh.setMatrixAt(index, object.matrix);
}

function writeCubeEdgeInstances(
  mesh,
  object: Object3D,
  startIndex: number,
  centerX: number,
  centerZ: number,
  size: number,
  depth: number,
  thickness: number,
) {
  const halfSize = size / 2;
  const halfThickness = thickness / 2;
  const topY = Math.max(halfThickness, depth - halfThickness);
  const midY = depth / 2;
  let index = startIndex;

  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX,
    halfThickness,
    centerZ + halfSize,
    size,
    thickness,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX,
    halfThickness,
    centerZ - halfSize,
    size,
    thickness,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX,
    topY,
    centerZ + halfSize,
    size,
    thickness,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX,
    topY,
    centerZ - halfSize,
    size,
    thickness,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX - halfSize,
    halfThickness,
    centerZ,
    thickness,
    thickness,
    size,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX + halfSize,
    halfThickness,
    centerZ,
    thickness,
    thickness,
    size,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX - halfSize,
    topY,
    centerZ,
    thickness,
    thickness,
    size,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX + halfSize,
    topY,
    centerZ,
    thickness,
    thickness,
    size,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX - halfSize,
    midY,
    centerZ + halfSize,
    thickness,
    depth,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX + halfSize,
    midY,
    centerZ + halfSize,
    thickness,
    depth,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX - halfSize,
    midY,
    centerZ - halfSize,
    thickness,
    depth,
    thickness,
  );
  setInstanceTransform(
    mesh,
    object,
    index++,
    centerX + halfSize,
    midY,
    centerZ - halfSize,
    thickness,
    depth,
    thickness,
  );

  return index;
}

function createCubeSurfaceMaterial(material: string, props) {
  switch (material) {
    case 'Basic':
      return new MeshBasicMaterial(props);
    case 'Lambert':
      return new MeshLambertMaterial(props);
    case 'Normal':
      return new MeshNormalMaterial(props);
    case 'Phong':
      return new MeshPhongMaterial(props);
    case 'Physical':
      return new MeshPhysicalMaterial(props);
    default:
      return new MeshStandardMaterial(props);
  }
}

export function CubesDisplayLayer3D({
  display,
  order,
  frameData,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
}) {
  const { properties = {} } = display;
  const {
    material = 'Standard',
    shading = 'Smooth',
    color = '#000000',
    wireframe = false,
    edges = true,
    edgeColor = '#FFFFFF',
    x = 0,
    y = 0,
    z = 0,
    rows = 8,
    columns = 8,
    separation = 32,
    gap = 2,
    motion = 'Horizontal',
    height: heightScale = 28,
    speed = 1,
    frequencyX = 0.3,
    frequencyY = 0.5,
    opacity = 1,
    texture: textureSrc = '',
  } = properties;

  const textureMap = useTexture3D(textureSrc || undefined);

  const timeRef = React.useRef(0);
  const surfaceMeshRef = React.useRef(null);
  const edgeMeshRef = React.useRef(null);
  const surfaceInstanceObject = React.useMemo(() => new Object3D(), []);
  const edgeInstanceObject = React.useMemo(() => new Object3D(), []);

  if (frameData?.hasUpdate) {
    timeRef.current +=
      (Math.max(0, Number(frameData?.delta ?? 16.667)) / 1000) * Math.max(0, Number(speed) || 0);
  }

  const gridRows = Math.max(1, Math.round(Number(rows) || 1));
  const gridColumns = Math.max(1, Math.round(Number(columns) || 1));
  const gridSeparation = Math.max(8, Number(separation) || 8);
  const gridWidth = gridSeparation * gridColumns;
  const gridHeight = gridSeparation * gridRows;
  const blockGap = clamp(Number(gap) || 0, 0, Math.max(0, gridSeparation - 2));
  const cubeSize = Math.max(2, gridSeparation - blockGap);
  const cellDepth = gridSeparation;
  const baseDepth = Math.max(4, cellDepth * DEPTH_BASE_RATIO);
  const maxDepth = cellDepth * DEPTH_MAX_RATIO;
  const extrusionHeight = Math.max(0, Number(heightScale) || 0);
  const resolvedFrequencyX = Math.max(0.05, Number(frequencyX) || 0.05);
  const resolvedFrequencyY = Math.max(0.05, Number(frequencyY) || 0.05);
  const finalOpacity = clamp(Number(opacity ?? 1) * Number(sceneOpacity ?? 1), 0, 1);
  const blending = sceneMask ? CustomBlending : getThreeBlending(sceneBlendMode);
  const resolvedSurfaceColor = sceneMask ? '#000000' : color;
  const resolvedBorderColor = sceneMask ? '#000000' : edgeColor;
  const litSurfaceColor = React.useMemo(
    () => getLiftedSurfaceColor(resolvedSurfaceColor),
    [resolvedSurfaceColor],
  );
  const litBorderColor = React.useMemo(
    () => getLiftedSurfaceColor(resolvedBorderColor),
    [resolvedBorderColor],
  );
  const premultipliedAlpha = requiresPremultipliedAlpha(sceneBlendMode);
  const borderOpacity = sceneMask ? 1 : Math.min(1, finalOpacity * 0.95);
  const meshPosition = [Number(x) || 0, -(Number(y) || 0), Number(z) || 0];
  const surfaceEmissiveColor = React.useMemo(
    () => new Color(resolvedSurfaceColor).multiplyScalar(sceneMask ? 0 : 0.08),
    [resolvedSurfaceColor, sceneMask],
  );
  const boxGeometry = React.useMemo(() => {
    const geometry = new BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    return geometry;
  }, []);
  const edgeGeometry = React.useMemo(() => new BoxGeometry(1, 1, 1), []);
  const surfaceMaterial = React.useMemo(
    () =>
      createCubeSurfaceMaterial(String(material || 'Standard'), {
        color: String(material || 'Standard') === 'Normal' ? undefined : litSurfaceColor,
        emissive:
          String(material || 'Standard') === 'Basic' || String(material || 'Standard') === 'Normal'
            ? undefined
            : surfaceEmissiveColor,
        transparent: true,
        opacity: finalOpacity,
        wireframe,
        flatShading: shading === 'Flat',
        roughness: 0.72,
        metalness: 0.04,
        premultipliedAlpha,
        blending,
        depthTest: true,
        depthWrite: true,
        blendEquation: sceneMask ? AddEquation : undefined,
        blendSrc: sceneMask ? ZeroFactor : undefined,
        blendDst: sceneMask ? OneFactor : undefined,
        blendEquationAlpha: sceneMask ? AddEquation : undefined,
        blendSrcAlpha: sceneMask ? OneFactor : undefined,
        blendDstAlpha: sceneMask ? ZeroFactor : undefined,
        ...(textureMap ? { map: textureMap } : {}),
      }),
    [
      blending,
      finalOpacity,
      litSurfaceColor,
      material,
      premultipliedAlpha,
      shading,
      surfaceEmissiveColor,
      sceneMask,
      textureMap,
      wireframe,
    ],
  );
  const edgeMaterial = React.useMemo(
    () =>
      new MeshStandardMaterial({
        color: litBorderColor,
        transparent: true,
        opacity: borderOpacity,
        roughness: 0.7,
        metalness: 0.03,
        premultipliedAlpha,
        blending,
        depthTest: true,
        depthWrite: true,
        blendEquation: sceneMask ? AddEquation : undefined,
        blendSrc: sceneMask ? ZeroFactor : undefined,
        blendDst: sceneMask ? OneFactor : undefined,
        blendEquationAlpha: sceneMask ? AddEquation : undefined,
        blendSrcAlpha: sceneMask ? OneFactor : undefined,
        blendDstAlpha: sceneMask ? ZeroFactor : undefined,
      }),
    [blending, borderOpacity, litBorderColor, premultipliedAlpha, sceneMask],
  );
  React.useEffect(() => {
    return () => {
      boxGeometry.dispose();
      edgeGeometry.dispose();
      surfaceMaterial.dispose();
      edgeMaterial.dispose();
    };
  }, [boxGeometry, edgeGeometry, edgeMaterial, surfaceMaterial]);

  const cubeTransforms = [];
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
      const displacement = sampleProceduralGridMotion(
        String(motion || 'Horizontal'),
        motionContext,
        extrusionHeight,
      );
      const cubeX = -gridWidth / 2 + gridSeparation * (columnIndex + 0.5);
      const cubeZ = -gridHeight / 2 + gridSeparation * (rowIndex + 0.5);
      const depth = clamp(baseDepth + displacement, 2, baseDepth + maxDepth);
      cubeTransforms.push({
        x: cubeX,
        z: cubeZ,
        depth,
        edgeThickness: getCubeEdgeThickness(cubeSize, depth),
      });
    }
  }
  const cubeCount = cubeTransforms.length;
  const edgeCount = edges ? cubeCount * EDGE_SEGMENT_COUNT : 0;

  React.useLayoutEffect(() => {
    const surfaceMesh = surfaceMeshRef.current;
    if (surfaceMesh) {
      for (let index = 0; index < cubeCount; index += 1) {
        const cube = cubeTransforms[index];
        setInstanceTransform(
          surfaceMesh,
          surfaceInstanceObject,
          index,
          cube.x,
          0,
          cube.z,
          cubeSize,
          cube.depth,
          cubeSize,
        );
      }
      surfaceMesh.count = cubeCount;
      surfaceMesh.instanceMatrix.needsUpdate = true;
      surfaceMesh.computeBoundingSphere?.();
    }

    const edgeMesh = edgeMeshRef.current;
    if (edges && edgeMesh) {
      let edgeIndex = 0;
      for (let index = 0; index < cubeCount; index += 1) {
        const cube = cubeTransforms[index];
        edgeIndex = writeCubeEdgeInstances(
          edgeMesh,
          edgeInstanceObject,
          edgeIndex,
          cube.x,
          cube.z,
          cubeSize,
          cube.depth,
          cube.edgeThickness,
        );
      }
      edgeMesh.count = edgeIndex;
      edgeMesh.instanceMatrix.needsUpdate = true;
      edgeMesh.computeBoundingSphere?.();
    }
  }, [cubeCount, cubeSize, cubeTransforms, edgeInstanceObject, edges, surfaceInstanceObject]);

  return (
    <group position={meshPosition}>
      <mesh
        position={[0, -maxDepth * 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        renderOrder={order - 0.01}
      >
        <planeGeometry args={[gridWidth + cubeSize, gridHeight + cubeSize]} />
        <shadowMaterial transparent={true} opacity={0.68} />
      </mesh>
      <instancedMesh
        key={`cube-surfaces-${cubeCount}`}
        ref={surfaceMeshRef}
        args={[boxGeometry, surfaceMaterial, cubeCount]}
        renderOrder={order}
        castShadow={true}
        receiveShadow={true}
        frustumCulled={false}
      />
      {edges && edgeCount > 0 && (
        <instancedMesh
          key={`cube-edges-${edgeCount}`}
          ref={edgeMeshRef}
          args={[edgeGeometry, edgeMaterial, edgeCount]}
          renderOrder={order + 0.01}
          frustumCulled={false}
        />
      )}
    </group>
  );
}
