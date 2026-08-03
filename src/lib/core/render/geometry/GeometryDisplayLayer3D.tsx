// @ts-nocheck

import React from 'react';
import { AddEquation, CustomBlending, DoubleSide, FrontSide, OneFactor, ZeroFactor } from 'three';
import FFTParser from '@/lib/audio/FFTParser';
import { getThreeBlending, requiresPremultipliedAlpha } from '../layers/TexturePlane';
import { createGeometryNode, getMaterialNode, isPointsMaterial } from './GeometryDisplayLayer';
import { useTexture3D } from './useTexture3D';

export function GeometryDisplayLayer3D({
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
    pointSize = 8,
    opacity = 1,
    texture: textureSrc = '',
  } = properties;

  const textureMap = useTexture3D(textureSrc || undefined);

  const parserRef = React.useRef(new FFTParser(properties));
  const rotationRef = React.useRef({ x: 0, y: 0, z: 0 });

  parserRef.current.update(properties);

  if (frameData?.hasUpdate && frameData.fft) {
    const fft = parserRef.current.parseFFT(frameData.fft);

    rotationRef.current.x += 5 * (fft[0] || 0);
    rotationRef.current.y += 3 * (fft[3] || 0);
    rotationRef.current.z += 2 * (fft[2] || 0);
  }

  const meshPosition = [x, -y, z];
  const meshRotation = [rotationRef.current.x, rotationRef.current.y, rotationRef.current.z];
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
        ...(textureMap ? { map: textureMap } : {}),
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
        {getMaterialNode(material, geometryMaterialProps)}
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
