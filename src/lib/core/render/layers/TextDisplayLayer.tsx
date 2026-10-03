// @ts-nocheck
import React from 'react';
import CanvasText from '@/lib/canvas/CanvasText';
import { CanvasTextureLayer } from './CanvasTextureLayer';

export function TextDisplayLayer({ display, order, frameData }) {
  const textRef = React.useRef(null);
  const uploadedVersion = React.useRef(-1);
  const [, refreshFont] = React.useReducer(version => version + 1, 0);

  const drawFrame = React.useCallback(({ context, properties }) => {
    if (!textRef.current) {
      textRef.current = new CanvasText(properties, context.canvas);
      textRef.current.onFontLoad = refreshFont;
    }

    textRef.current.update(properties);
    textRef.current.render();

    // Returning nothing skips the GPU upload in CanvasTextureLayer.
    // Transforms and opacity still update on TexturePlane.
    if (uploadedVersion.current === textRef.current.version) {
      return null;
    }
    uploadedVersion.current = textRef.current.version;

    const width = Math.max(1, context.canvas.width || 1);
    const height = Math.max(1, context.canvas.height || 1);

    return {
      width,
      height,
      originX: width / 2,
      originY: height / 2,
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (textRef.current) {
        textRef.current.onFontLoad = undefined;
      }
      textRef.current = null;
      uploadedVersion.current = -1;
    };
  }, []);

  return (
    <CanvasTextureLayer
      display={display}
      order={order}
      frameData={frameData}
      drawFrame={drawFrame}
    />
  );
}
