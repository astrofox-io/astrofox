// @ts-nocheck

import { BLANK_IMAGE } from '@/app/constants';
import { registerDisplayCamera, unregisterDisplayCamera } from '@/lib/utils/displayCamera';
import {
  Display3DLayer,
  GeometryDisplayLayer3D,
  MeshGridDisplayLayer3D,
  TunnelDisplayLayer3D,
} from './geometry';
import {
  BarSpectrumDisplayLayer,
  ImageDisplayLayer,
  RadialSpectrumDisplayLayer,
  ShapeDisplayLayer,
  SoundWaveDisplayLayer,
  TextDisplayLayer,
  VideoDisplayLayer,
  WaveformRingDisplayLayer,
  WaveSpectrumDisplayLayer,
} from './layers';

/**
 * Maps a display's `name` to how it renders on the stage. An entry's `render`
 * receives { display, order, frameData, width, height, scene, sceneProps,
 * cameraModeActive } and returns a React node (or null to render nothing this
 * frame). Every display is a layer in the scene's 2D stack; `camera: true`
 * marks displays that own a 3D camera (rendered through Display3DLayer) so
 * the stage can offer camera controls for them.
 *
 * Core displays register below; external plugins register at install time.
 */
const registry = new Map();

export function registerDisplayLayer(name, { camera = false, render }) {
  registry.set(name, { camera, render });
  registerDisplayCamera(name, camera);
}

export function unregisterDisplayLayer(name) {
  registry.delete(name);
  unregisterDisplayCamera(name);
}

export function getDisplayLayerEntry(name) {
  return registry.get(name) ?? null;
}

function simple2D(Component, { withFrameData = true } = {}) {
  return {
    render: ({ display, order, frameData, sceneProps }) => (
      <Component
        display={display}
        order={order}
        {...(withFrameData ? { frameData } : {})}
        {...sceneProps}
      />
    ),
  };
}

registerDisplayLayer('ImageDisplay', {
  render: ({ display, order, sceneProps }) => {
    const src = display.properties?.src;
    if (!src || src === BLANK_IMAGE) {
      return null;
    }
    return <ImageDisplayLayer display={display} order={order} {...sceneProps} />;
  },
});

registerDisplayLayer('VideoDisplay', simple2D(VideoDisplayLayer, { withFrameData: false }));
registerDisplayLayer('TextDisplay', simple2D(TextDisplayLayer));
registerDisplayLayer('ShapeDisplay', simple2D(ShapeDisplayLayer));
registerDisplayLayer('BarSpectrumDisplay', simple2D(BarSpectrumDisplayLayer));
registerDisplayLayer('RadialSpectrumDisplay', simple2D(RadialSpectrumDisplayLayer));
registerDisplayLayer('WaveSpectrumDisplay', simple2D(WaveSpectrumDisplayLayer));
registerDisplayLayer('WaveformRingDisplay', simple2D(WaveformRingDisplayLayer));
registerDisplayLayer('SoundWaveDisplay', simple2D(SoundWaveDisplayLayer));

function camera3D(Component) {
  return {
    camera: true,
    render: ({ display, order, frameData, width, height, cameraModeActive, sceneProps }) => (
      <Display3DLayer
        display={display}
        order={order}
        width={width}
        height={height}
        cameraModeActive={cameraModeActive}
      >
        <Component display={display} order={order} frameData={frameData} {...sceneProps} />
      </Display3DLayer>
    ),
  };
}

registerDisplayLayer('GeometryDisplay', camera3D(GeometryDisplayLayer3D));
registerDisplayLayer('TunnelDisplay', camera3D(TunnelDisplayLayer3D));
registerDisplayLayer('MeshGridDisplay', camera3D(MeshGridDisplayLayer3D));
