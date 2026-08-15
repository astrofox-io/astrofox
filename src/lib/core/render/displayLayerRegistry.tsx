// @ts-nocheck

import React from 'react';
import { BLANK_IMAGE } from '@/app/constants';
import {
  registerDisplayRenderGroup,
  unregisterDisplayRenderGroup,
} from '@/lib/utils/displayRenderGroup';
import {
  CubesDisplayLayer3D,
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
 * receives { display, order, frameData, width, height, scene, sceneProps } and
 * returns a React node (or null to render nothing this frame). `group`
 * decides whether the node lives in the 2D plane stack or the shared
 * perspective 3D scene.
 *
 * Core displays register below; external modules register at install time.
 */
const registry = new Map();

export function registerDisplayLayer(name, { group = '2d', render }) {
  registry.set(name, { group, render });
  registerDisplayRenderGroup(name, group);
}

export function unregisterDisplayLayer(name) {
  registry.delete(name);
  unregisterDisplayRenderGroup(name);
}

export function getDisplayLayerEntry(name) {
  return registry.get(name) ?? null;
}

function simple2D(Component, { withFrameData = true } = {}) {
  return {
    group: '2d',
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
  group: '2d',
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

registerDisplayLayer('GeometryDisplay', {
  group: '3d',
  render: ({ display, order, frameData, sceneProps }) => (
    <GeometryDisplayLayer3D display={display} order={order} frameData={frameData} {...sceneProps} />
  ),
});

registerDisplayLayer('TunnelDisplay', {
  group: '3d',
  render: ({ display, order, frameData, height, scene, sceneProps }) => (
    <TunnelDisplayLayer3D
      display={display}
      order={order}
      height={height}
      sceneProperties={scene.properties || {}}
      frameData={frameData}
      {...sceneProps}
    />
  ),
});

registerDisplayLayer('CubesDisplay', {
  group: '3d',
  render: ({ display, order, frameData, width, height, sceneProps }) => (
    <CubesDisplayLayer3D
      display={display}
      order={order}
      width={width}
      height={height}
      frameData={frameData}
      {...sceneProps}
    />
  ),
});

registerDisplayLayer('MeshGridDisplay', {
  group: '3d',
  render: ({ display, order, frameData, sceneProps }) => (
    <MeshGridDisplayLayer3D display={display} order={order} frameData={frameData} {...sceneProps} />
  ),
});
