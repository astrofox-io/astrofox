// @ts-nocheck

import {
  registerDisplayLayer,
  unregisterDisplayLayer,
} from '@/lib/core/render/displayLayerRegistry';
import { ShaderDisplayLayer } from './ShaderDisplayLayer';
import type { InstalledPlugin } from './types';

export function registerShaderDisplayRuntime(installed: InstalledPlugin) {
  registerDisplayLayer(installed.manifest.name, {
    render: ({ display, order, frameData, sceneProps }) => (
      <ShaderDisplayLayer
        installed={installed}
        display={display}
        order={order}
        frameData={frameData}
        {...sceneProps}
      />
    ),
  });
}

export function unregisterShaderDisplayRuntime(name: string) {
  unregisterDisplayLayer(name);
}
