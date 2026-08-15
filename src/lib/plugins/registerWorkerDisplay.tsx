// @ts-nocheck

import React from 'react';
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
    group: '2d',
    render: ({ display, order, frameData, sceneProps }) => (
      <ExternalDisplayLayer display={display} order={order} frameData={frameData} {...sceneProps} />
    ),
  });
}

export function unregisterWorkerDisplayRuntime(name: string) {
  unregisterDisplayLayer(name);
  unregisterPluginWorkerHost(name);
}
