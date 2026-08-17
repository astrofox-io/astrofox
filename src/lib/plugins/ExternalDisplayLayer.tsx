// @ts-nocheck

import { useThree } from '@react-three/fiber';
import React from 'react';
import { updateElementProperties } from '@/app/actions/scenes';
import { renderer } from '@/app/global';
import { getDefaultCameraDistance } from '@/lib/core/render/geometry/Display3DLayer';
import {
  clampCameraDistance,
  clampCameraPolar,
  useCameraOrbit,
} from '@/lib/core/render/geometry/useCameraOrbit';
import { CanvasTextureLayer } from '@/lib/core/render/layers';
import { getPluginWorkerHost } from './PluginHost';

const VIDEO_RENDERING = -1;

/**
 * Generic stage layer for worker-runtime display plugins. Reuses the
 * CanvasTextureLayer/TexturePlane pipeline: the plugin's transferred
 * ImageBitmap is drawn into the layer canvas, which then gets the standard
 * transform, blending and scene handling every core 2D display has.
 */
/**
 * Stage-side orbit controller for camera-enabled worker plugins. The plugin
 * owns its three.js camera; the host only edits the display's
 * cameraAzimuth/cameraPolar/cameraDistance properties (live while dragging,
 * persisted to the project on release), which the plugin reads in update().
 */
function useExternalCameraOrbit(display, cameraModeActive) {
  const gl = useThree(state => state.gl);
  const properties = display.properties || {};
  const canvasHeight = Number(properties.height) || 512;
  const defaultDistance = getDefaultCameraDistance(canvasHeight);
  const stateRef = React.useRef({ azimuth: 0, polar: 0, distance: defaultDistance });

  const applyLive = React.useCallback(
    state => {
      // Mutate the stage instance directly (like the control panel does) so
      // the next frame ships the new values to the worker; no store churn.
      display.update?.({
        cameraAzimuth: state.azimuth,
        cameraPolar: state.polar,
        cameraDistance: state.distance,
      });
      renderer.requestRender();
    },
    [display],
  );

  const persist = React.useCallback(
    state => {
      updateElementProperties(display.id, {
        cameraAzimuth: state.azimuth,
        cameraPolar: state.polar,
        cameraDistance: state.distance,
      });
    },
    [display.id],
  );

  const draggingRef = useCameraOrbit({
    enabled: cameraModeActive,
    element: gl.domElement,
    stateRef,
    onChange: applyLive,
    onCommit: persist,
  });

  const cameraAzimuth = properties.cameraAzimuth;
  const cameraPolar = properties.cameraPolar;
  const cameraDistance = properties.cameraDistance;

  React.useLayoutEffect(() => {
    if (draggingRef.current) {
      return;
    }

    stateRef.current = {
      azimuth: Number(cameraAzimuth ?? 0),
      polar: clampCameraPolar(Number(cameraPolar ?? 0)),
      distance: clampCameraDistance(Number(cameraDistance ?? defaultDistance) || defaultDistance),
    };
  }, [cameraAzimuth, cameraPolar, cameraDistance, defaultDistance, draggingRef]);
}

export function ExternalDisplayLayer({
  display,
  order,
  frameData,
  cameraModeActive = false,
  ...sceneProps
}) {
  const host = getPluginWorkerHost(display.name);
  const bitmapRef = React.useRef(null);

  useExternalCameraOrbit(display, cameraModeActive);

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
