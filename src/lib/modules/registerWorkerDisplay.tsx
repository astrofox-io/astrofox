// @ts-nocheck

import React from 'react';
import {
  registerDisplayLayer,
  unregisterDisplayLayer,
} from '@/lib/core/render/displayLayerRegistry';
import { ExternalDisplayLayer } from './ExternalDisplayLayer';
import { registerModuleWorkerHost, unregisterModuleWorkerHost } from './ModuleHost';
import type { InstalledModule } from './types';

export function registerWorkerDisplayRuntime(installed: InstalledModule) {
  registerModuleWorkerHost(installed);

  registerDisplayLayer(installed.manifest.name, {
    group: '2d',
    render: ({ display, order, frameData, sceneProps }) => (
      <ExternalDisplayLayer display={display} order={order} frameData={frameData} {...sceneProps} />
    ),
  });
}

export function unregisterWorkerDisplayRuntime(name: string) {
  unregisterDisplayLayer(name);
  unregisterModuleWorkerHost(name);
}
