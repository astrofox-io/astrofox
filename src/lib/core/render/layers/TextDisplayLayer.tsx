// @ts-nocheck
import React from 'react';
import CanvasText from '@/lib/canvas/CanvasText';
import { CanvasTextureLayer } from './CanvasTextureLayer';

export function TextDisplayLayer({ display, order, frameData }) {
  const textRef = React.useRef(null);

  const drawFrame = React.useCallback(({ context, properties }) => {
    if (!textRef.current) {
      textRef.current = new CanvasText(properties, context.canvas);
    }

    textRef.current.update(properties);
    textRef.current.render();

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
      textRef.current = null;
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
