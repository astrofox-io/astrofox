import {
  registerEffectPass,
  unregisterEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import { createExternalEntityClass } from './ExternalEntity';
import { verifyIntegrity } from './integrity';
import { getInstalledPlugins, removeInstalledPlugin } from './PluginStore';
import {
  registerShaderDisplayRuntime,
  unregisterShaderDisplayRuntime,
} from './registerShaderDisplay';
import {
  registerWorkerDisplayRuntime,
  unregisterWorkerDisplayRuntime,
} from './registerWorkerDisplay';
import { createShaderEffectPassFactory } from './shaderEffectFactory';
import type { InstalledPlugin, LibraryEntityClass } from './types';

export { fetchPluginPackage, installPluginPackage } from './PluginInstaller';
export { getInstalledPlugin, getInstalledPlugins } from './PluginStore';
export type { InstalledPlugin, PluginManifest, PluginPackage } from './types';

async function verifyPluginIntegrity(installed: InstalledPlugin) {
  for (const [ref, content] of Object.entries(installed.files)) {
    if (!(await verifyIntegrity(content, installed.integrity[ref]))) {
      throw new Error(`Integrity check failed for ${installed.manifest.name} (${ref})`);
    }
  }
}

/**
 * Registers a plugin's runtime (pass factory / stage layer) and returns the
 * library-registrable entity class. Throws for runtimes this build does not
 * support yet.
 */
export function registerPluginRuntime(installed: InstalledPlugin): LibraryEntityClass {
  const { manifest } = installed;

  if (manifest.type === 'effect' && manifest.runtime === 'shader') {
    registerEffectPass(manifest.name, createShaderEffectPassFactory(installed), {
      liveUpdatable: true,
    });
    return createExternalEntityClass(installed);
  }

  if (manifest.type === 'display' && manifest.runtime === 'worker') {
    registerWorkerDisplayRuntime(installed);
    return createExternalEntityClass(installed);
  }

  if (manifest.type === 'display' && manifest.runtime === 'shader') {
    registerShaderDisplayRuntime(installed);
    return createExternalEntityClass(installed);
  }

  throw new Error(
    `Plugin ${manifest.name}: unsupported combination type=${manifest.type} runtime=${manifest.runtime}`,
  );
}

export function unregisterPluginRuntime(name: string) {
  unregisterEffectPass(name);
  unregisterWorkerDisplayRuntime(name);
  unregisterShaderDisplayRuntime(name);
}

/**
 * Loads all installed plugins from the store, re-verifying content hashes.
 * Returns library entries keyed by plugin name; failures are skipped so one
 * broken plugin can't take the app down.
 */
export async function loadInstalledPlugins(): Promise<Record<string, LibraryEntityClass>> {
  const result: Record<string, LibraryEntityClass> = {};

  for (const [name, installed] of Object.entries(getInstalledPlugins())) {
    try {
      if (!installed.dev) {
        await verifyPluginIntegrity(installed);
      }
      result[name] = registerPluginRuntime(installed);
    } catch (e) {
      console.error(`Failed to load plugin ${name}:`, e);
    }
  }

  return result;
}

export function uninstallPlugin(name: string) {
  unregisterPluginRuntime(name);
  removeInstalledPlugin(name);
}
