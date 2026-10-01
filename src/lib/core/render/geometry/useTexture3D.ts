import React from 'react';
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import { registerFramePreparer } from '../framePreparation';

const textureLoader = new TextureLoader();

/**
 * Loads a Three.js texture from a source URL (or data-URI).
 * Returns `null` when no source is provided.
 * Disposes the previous texture automatically when the source changes or on unmount.
 */
export function useTexture3D(src: string | undefined): Texture | null {
  const [texture, setTexture] = React.useState<Texture | null>(null);

  React.useEffect(() => {
    if (!src) {
      setTexture(null);
      return;
    }

    let settle = () => {};
    const ready = new Promise<void>(resolve => {
      settle = resolve;
    });
    const tex = textureLoader.load(
      src,
      (loaded: Texture) => {
        loaded.minFilter = LinearMipmapLinearFilter;
        loaded.magFilter = LinearFilter;
        loaded.colorSpace = SRGBColorSpace;
        loaded.generateMipmaps = true;
        loaded.needsUpdate = true;
        setTexture(loaded);
        settle();
      },
      undefined,
      settle,
    );
    // Offline frames wait until the texture has loaded.
    const unregister = registerFramePreparer(() => ready);

    return () => {
      unregister();
      tex.dispose();
      setTexture(null);
    };
  }, [src]);

  return texture;
}
