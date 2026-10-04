// @ts-nocheck
import { useThree } from '@react-three/fiber';
import React from 'react';
import { events } from '@/app/global';
import CanvasText, { TEXT_PIXEL_RATIO } from '@/lib/canvas/CanvasText';
import { CanvasTextureLayer } from './CanvasTextureLayer';

export function TextDisplayLayer({ display, order, frameData }) {
  const textRef = React.useRef(null);
  const invalidate = useThree(state => state.invalidate);
  const uploadedVersion = React.useRef(-1);
  const [, refreshFont] = React.useReducer(version => version + 1, 0);
  const { text = '', color = '#FFFFFF' } = display.properties;
  // Colour fonts (such as emoji) contain their own RGB pixels. Keep those,
  // and colours with possible alpha, on the original canvas-colour path.
  const tint =
    /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color) &&
    !/(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3)/u.test(text);

  const drawFrame = React.useCallback(
    ({ context, properties }) => {
      if (!textRef.current) {
        textRef.current = new CanvasText(properties, context.canvas);
        textRef.current.onFontLoad = refreshFont;
      }

      display.text = textRef.current;
      textRef.current.update({ ...properties, color: tint ? '#FFFFFF' : properties.color });
      textRef.current.render();

      // Returning nothing skips the GPU upload in CanvasTextureLayer.
      // Transforms and opacity still update on TexturePlane.
      if (uploadedVersion.current === textRef.current.version) {
        return null;
      }
      uploadedVersion.current = textRef.current.version;

      const width = Math.max(1, context.canvas.width || 1);
      const height = Math.max(1, context.canvas.height || 1);
      // The backend's render event can precede this React commit. Notify the
      // overlay after drawing, including when a web font finishes loading.
      events.emit('displayBoundsChanged');
      invalidate();

      return {
        width,
        height,
        originX: width / 2,
        originY: height / 2,
      };
    },
    [display, tint, invalidate],
  );

  React.useEffect(() => {
    return () => {
      if (textRef.current) {
        textRef.current.onFontLoad = undefined;
        if (display.text === textRef.current) {
          display.text = undefined;
        }
      }
      textRef.current = null;
      uploadedVersion.current = -1;
    };
  }, [display]);

  return (
    <CanvasTextureLayer
      display={display}
      order={order}
      frameData={frameData}
      drawFrame={drawFrame}
      color={tint ? color : '#FFFFFF'}
      pixelRatio={TEXT_PIXEL_RATIO}
    />
  );
}
