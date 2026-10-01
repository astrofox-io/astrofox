// @ts-nocheck

import { registerDisplayCamera, unregisterDisplayCamera } from '@/lib/utils/displayCamera';
import { Display3DLayer } from './geometry/Display3DLayer';

/**
 * Maps a display's `name` to how it renders on the stage. An entry's `render`
 * receives { display, order, frameData, width, height, scene, cameraModeActive } and returns a React node (or null to render nothing this
 * frame). Every display is a layer in the scene's 2D stack; `camera: true`
 * marks displays that own a 3D camera (rendered through Display3DLayer) so
 * the stage can offer camera controls for them.
 *
 * Core displays register themselves from their entity module
 * (src/lib/displays/*), the same way effects register their passes; plugin
 * displays register at install time. StageRoot consults only this registry,
 * so adding a display touches its own module and its layer component.
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

/**
 * A display drawn by a 2D layer component, which receives { display, order,
 * frameData }. `when`, if given, decides per frame whether there is anything
 * to draw.
 */
export function layer2D(Component, { when } = {}) {
  return {
    render: ({ display, order, frameData }) =>
      when && !when(display) ? null : (
        <Component display={display} order={order} frameData={frameData} />
      ),
  };
}

/**
 * A display with its own 3D scene and camera: the component renders inside
 * Display3DLayer, which owns the camera, orbit controls and the texture it is
 * composited from.
 */
export function layer3D(Component) {
  return {
    camera: true,
    render: ({ display, order, frameData, width, height, cameraModeActive }) => (
      <Display3DLayer
        display={display}
        order={order}
        width={width}
        height={height}
        cameraModeActive={cameraModeActive}
      >
        <Component display={display} order={order} frameData={frameData} />
      </Display3DLayer>
    ),
  };
}
