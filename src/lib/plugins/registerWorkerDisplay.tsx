// @ts-nocheck

import {
  registerDisplayLayer,
  unregisterDisplayLayer,
} from '@/lib/core/render/displayLayerRegistry';
import { ExternalDisplayLayer } from './ExternalDisplayLayer';
import { registerPluginWorkerHost, unregisterPluginWorkerHost } from './PluginHost';
import type { InstalledPlugin } from './types';

export function registerWorkerDisplayRuntime(installed: InstalledPlugin) {
  registerPluginWorkerHost(installed);

  registerDisplayLayer(installed.manifest.name, {
    camera: installed.manifest.camera === true,
    render: ({ display, order, frameData, cameraModeActive, sceneProps }) => (
      <ExternalDisplayLayer
        display={display}
        order={order}
        frameData={frameData}
        cameraModeActive={cameraModeActive}
        {...sceneProps}
      />
    ),
  });
}

export function unregisterWorkerDisplayRuntime(name: string) {
  unregisterDisplayLayer(name);
  unregisterPluginWorkerHost(name);
}
