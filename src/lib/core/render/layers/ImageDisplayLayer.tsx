// @ts-nocheck
import { useThree } from '@react-three/fiber';
import React from 'react';
import { LinearFilter, SRGBColorSpace, TextureLoader } from 'three';
import { registerFramePreparer } from '../framePreparation';
import { TexturePlane } from './TexturePlane';

export function ImageDisplayLayer({ display, order }) {
  const invalidate = useThree(state => state.invalidate);
  const { properties = {} } = display;
  const {
    src,
    x = 0,
    y = 0,
    rotation = 0,
    zoom = 1,
    opacity = 1,
    width = 0,
    height = 0,
  } = properties;

  const { texture, loaded } = React.useMemo(() => {
    let settle = () => {};
    const loaded = new Promise(resolve => {
      settle = resolve;
    });
    const nextTexture = new TextureLoader().load(
      src,
      () => {
        invalidate();
        settle();
      },
      undefined,
      settle,
    );
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.generateMipmaps = false;
    nextTexture.needsUpdate = true;

    return { texture: nextTexture, loaded };
  }, [src, invalidate]);

  // Offline frames wait until the image has loaded.
  React.useEffect(() => registerFramePreparer(() => loaded), [loaded]);

  React.useEffect(() => {
    return () => {
      if (texture?.dispose) {
        texture.dispose();
      }
    };
  }, [texture]);

  const image = texture?.image;
  const naturalWidth = image?.naturalWidth || image?.videoWidth || image?.width || 1;
  const naturalHeight = image?.naturalHeight || image?.videoHeight || image?.height || 1;
  const planeWidth = width || naturalWidth;
  const planeHeight = height || naturalHeight;

  return (
    <TexturePlane
      texture={texture}
      width={planeWidth}
      height={planeHeight}
      x={x}
      y={y}
      originX={planeWidth / 2}
      originY={planeHeight / 2}
      rotation={rotation}
      zoom={zoom}
      opacity={opacity}
      renderOrder={order}
    />
  );
}
