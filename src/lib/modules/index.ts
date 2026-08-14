import {
  registerEffectPass,
  unregisterEffectPass,
} from '@/lib/core/render/effects/effectPassRegistry';
import { createExternalEntityClass } from './ExternalEntity';
import { verifyIntegrity } from './integrity';
import { getInstalledModules, removeInstalledModule } from './ModuleStore';
import { createShaderEffectPassFactory } from './shaderEffectFactory';
import type { InstalledModule, LibraryEntityClass } from './types';

export { fetchModulePackage, installModulePackage } from './ModuleInstaller';
export { getInstalledModule, getInstalledModules } from './ModuleStore';
export type { InstalledModule, ModuleManifest, ModulePackage } from './types';

async function verifyModuleIntegrity(installed: InstalledModule) {
  for (const [ref, content] of Object.entries(installed.files)) {
    if (!(await verifyIntegrity(content, installed.integrity[ref]))) {
      throw new Error(`Integrity check failed for ${installed.manifest.name} (${ref})`);
    }
  }
}

/**
 * Registers a module's runtime (pass factory / stage layer) and returns the
 * library-registrable entity class. Throws for runtimes this build does not
 * support yet.
 */
export function registerModuleRuntime(installed: InstalledModule): LibraryEntityClass {
  const { manifest } = installed;

  if (manifest.type === 'effect' && manifest.runtime === 'shader') {
    registerEffectPass(manifest.name, createShaderEffectPassFactory(installed), {
      liveUpdatable: true,
    });
    return createExternalEntityClass(installed);
  }

  throw new Error(
    `Module ${manifest.name}: unsupported combination type=${manifest.type} runtime=${manifest.runtime}`,
  );
}

export function unregisterModuleRuntime(name: string) {
  unregisterEffectPass(name);
}

/**
 * Loads all installed modules from the store, re-verifying content hashes.
 * Returns library entries keyed by module name; failures are skipped so one
 * broken module can't take the app down.
 */
export async function loadInstalledModules(): Promise<Record<string, LibraryEntityClass>> {
  const result: Record<string, LibraryEntityClass> = {};

  for (const [name, installed] of Object.entries(getInstalledModules())) {
    try {
      if (!installed.dev) {
        await verifyModuleIntegrity(installed);
      }
      result[name] = registerModuleRuntime(installed);
    } catch (e) {
      console.error(`Failed to load module ${name}:`, e);
    }
  }

  return result;
}

export function uninstallModule(name: string) {
  unregisterModuleRuntime(name);
  removeInstalledModule(name);
}
