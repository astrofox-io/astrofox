// @ts-nocheck

import React from 'react';
import { AddEquation, CustomBlending, DoubleSide, FrontSide, OneFactor, ZeroFactor } from 'three';
import { BLANK_IMAGE } from '@/app/constants';
import { deg2rad } from '@/lib/utils/math';
import { getThreeBlending, requiresPremultipliedAlpha } from '../layers/TexturePlane';
import { createGeometryNode, getMaterialNode, isPointsMaterial } from './geometryMaterials';
import { useTexture3D } from './useTexture3D';

export function GeometryDisplayLayer3D({
  display,
  order,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
}) {
  const { properties = {} } = display;
  const {
    shape = 'Box',
    material = 'Standard',
    shading = 'Smooth',
    color = '#FFFFFF',
    edges = false,
    edgeColor = '#FFFFFF',
    wireframe = false,
    x = 0,
    y = 0,
    z = 0,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    pointSize = 8,
    opacity = 1,
    texture: textureSrc = '',
  } = properties;

  const hasTexture =
    typeof textureSrc === 'string' && textureSrc !== '' && textureSrc !== BLANK_IMAGE;
  const textureMap = useTexture3D(hasTexture ? textureSrc : undefined);
  const materialRef = React.useRef(null);

  // Adding/removing a map changes the shader program; three.js needs an explicit recompile.
  React.useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true;
    }
  }, [textureMap]);

  const meshPosition = [x, -y, z];
  // Rotation values are in degrees.
  const meshRotation = [
    deg2rad(Number(rotationX) || 0),
    deg2rad(Number(rotationY) || 0),
    deg2rad(Number(rotationZ) || 0),
  ];
  const finalOpacity = Math.max(0, Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)));
  const blending = sceneMask ? CustomBlending : getThreeBlending(sceneBlendMode);
  const geometryColor = sceneMask ? '#000000' : color;
  const edgeOpacity = sceneMask ? Number(sceneInverse ? 1 : 0) : 0.9 * Number(sceneOpacity ?? 1);
  const GeometryPrimitive = isPointsMaterial(material) ? 'points' : 'mesh';
  const geometryMaterialProps = isPointsMaterial(material)
    ? {
        color: geometryColor,
        opacity: finalOpacity,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: requiresPremultipliedAlpha(sceneBlendMode),
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
        premultipliedAlpha: requiresPremultipliedAlpha(sceneBlendMode),
        blending,
        blendEquation: sceneMask ? AddEquation : undefined,
        blendSrc: sceneMask ? ZeroFactor : undefined,
        blendDst: sceneMask ? OneFactor : undefined,
        blendEquationAlpha: sceneMask ? AddEquation : undefined,
        blendSrcAlpha: sceneMask ? OneFactor : undefined,
        blendDstAlpha: sceneMask ? ZeroFactor : undefined,
        map: textureMap ?? null,
      };

  return (
    <group>
      <GeometryPrimitive
        key="mesh"
        position={meshPosition}
        rotation={meshRotation}
        renderOrder={order}
      >
        {createGeometryNode(shape, 'geometry')}
        {getMaterialNode(material, { ...geometryMaterialProps, ref: materialRef })}
      </GeometryPrimitive>
      {edges && (
        <mesh
          key="edge-overlay"
          position={meshPosition}
          rotation={meshRotation}
          renderOrder={order + 0.01}
        >
          {createGeometryNode(shape, 'edge-geometry')}
          <meshBasicMaterial
            color={edgeColor}
            wireframe={true}
            transparent={true}
            premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
            opacity={edgeOpacity}
            depthTest={true}
            depthWrite={false}
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
