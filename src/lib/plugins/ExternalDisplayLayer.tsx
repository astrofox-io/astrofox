// @ts-nocheck

import React from 'react';
import { CanvasTextureLayer } from '@/lib/core/render/layers';
import { getPluginWorkerHost } from './PluginHost';

const VIDEO_RENDERING = -1;

/**
 * Generic stage layer for worker-runtime display plugins. Reuses the
 * CanvasTextureLayer/TexturePlane pipeline: the plugin's transferred
 * ImageBitmap is drawn into the layer canvas, which then gets the standard
 * transform, blending and scene handling every core 2D display has.
 */
export function ExternalDisplayLayer({ display, order, frameData, ...sceneProps }) {
  const host = getPluginWorkerHost(display.name);
  const bitmapRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      bitmapRef.current?.bitmap.close();
      bitmapRef.current = null;
      getPluginWorkerHost(display.name)?.disposeInstance(display.id);
    };
  }, [display.name, display.id]);

  const drawFrame = React.useCallback(
    ({ context, canvas, properties, frameData: frame }) => {
      if (!host) {
        return null;
      }

      host.ensureInstance(display.id, properties);
      host.updateInstance(display.id, properties);

      // Export frames are pre-rendered synchronously by the export loop
      // (renderPluginFramesForExport); live frames are fire-and-forget.
      if (frame && frame.id !== VIDEO_RENDERING) {
        host.requestFrame(display.id, frame);
      }

      const rendered = host.takeRenderedFrame(display.id);
      if (rendered) {
        bitmapRef.current?.bitmap.close();
        bitmapRef.current = rendered;
      }

      const current = bitmapRef.current;
      if (!current) {
        return null;
      }

      const { bitmap, box } = current;
      const width = Math.max(1, bitmap.width);
      const height = Math.max(1, bitmap.height);

      if (canvas.width === width && canvas.height === height) {
        context.clearRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0);
      }

      return {
        width,
        height,
        originX: box?.originX ?? Math.round(width / 2),
        originY: box?.originY ?? Math.round(height / 2),
      };
    },
    [host, display.id],
  );

  return (
    <CanvasTextureLayer
      display={display}
      order={order}
      frameData={frameData}
      drawFrame={drawFrame}
      {...sceneProps}
    />
  );
}
