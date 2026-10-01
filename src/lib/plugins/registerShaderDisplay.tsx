// @ts-nocheck

import {
  registerDisplayLayer,
  unregisterDisplayLayer,
} from '@/lib/core/render/displayLayerRegistry';
import { ShaderDisplayLayer } from './ShaderDisplayLayer';
import type { InstalledPlugin } from './types';

export function registerShaderDisplayRuntime(installed: InstalledPlugin) {
  registerDisplayLayer(installed.manifest.name, {
    render: ({ display, order, frameData }) => (
      <ShaderDisplayLayer
        installed={installed}
        display={display}
        order={order}
        frameData={frameData}
      />
    ),
  });
}

export function unregisterShaderDisplayRuntime(name: string) {
  unregisterDisplayLayer(name);
}
