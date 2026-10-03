// @ts-nocheck
import { NormalBlending } from 'three';
import { toRadians } from '../constants';

/**
 * A display's drawing as a textured plane. Scene opacity and blend modes are
 * applied when scenes are composited (StageComposer), not per display.
 */
export function TexturePlane({
  texture,
  width,
  height,
  x,
  y,
  originX,
  originY,
  rotation,
  zoom,
  opacity,
  renderOrder,
  color = '#FFFFFF',
}) {
  const position = [x + (width / 2 - originX), -y + (height / 2 - originY), 0];
  const planeWidth = Math.max(1, width);
  const planeHeight = Math.max(1, height);
  const planeScale = [planeWidth * zoom, planeHeight * zoom, 1];
  const finalOpacity = Math.max(0, Math.min(1, Number(opacity ?? 1)));

  return (
    <mesh
      position={position}
      rotation={[0, 0, -toRadians(rotation)]}
      scale={planeScale}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color={color}
        map={texture}
        transparent={true}
        premultipliedAlpha={false}
        opacity={finalOpacity}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        blending={NormalBlending}
      />
    </mesh>
  );
}
