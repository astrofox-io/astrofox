import Display from '@/lib/core/Display';
import Effect from '@/lib/core/Effect';
import { stageHeight, stageWidth } from '@/lib/utils/controls';
import { resolveManifestControls } from './resolveControls';
import type { ExternalEntityConfig, InstalledModule, LibraryEntityClass } from './types';

// Every external display gets the standard transform block so it is
// positionable, blendable and reactor-able like core displays, and so the
// stage transform overlay works on it.
const STANDARD_DISPLAY_PROPERTIES: Record<string, unknown> = {
  x: 0,
  y: 0,
  rotation: 0,
  zoom: 1,
  opacity: 1.0,
};

function getStandardDisplayControls(): Record<string, Record<string, unknown>> {
  return {
    x: {
      label: 'X',
      type: 'number',
      min: stageWidth(n => -n),
      max: stageWidth(),
      withRange: true,
      hideFill: true,
    },
    y: {
      label: 'Y',
      type: 'number',
      min: stageHeight(n => -n),
      max: stageHeight(),
      withRange: true,
      hideFill: true,
    },
    rotation: {
      label: 'Rotation',
      type: 'number',
      min: 0,
      max: 360,
      withRange: true,
      withReactor: true,
    },
    zoom: {
      label: 'Zoom',
      type: 'number',
      min: 0.1,
      max: 5,
      step: 0.05,
      withRange: true,
      withReactor: true,
    },
    opacity: {
      label: 'Opacity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      withRange: true,
      withReactor: true,
    },
  };
}

/**
 * Builds a library-registrable Display/Effect subclass from an installed
 * module. Instances behave exactly like core entities (properties, reactors,
 * serialization); rendering is provided separately by the runtime the module
 * declares (shader pass factory or worker layer).
 */
export function createExternalEntityClass(installed: InstalledModule): LibraryEntityClass {
  const { manifest } = installed;
  const isEffect = manifest.type === 'effect';
  const Base = (isEffect ? Effect : Display) as unknown as new (
    Type: unknown,
    properties?: Record<string, unknown>,
  ) => { toJSON(): Record<string, unknown> };

  const controls = resolveManifestControls(manifest.controls);

  if (!isEffect) {
    for (const [key, control] of Object.entries(getStandardDisplayControls())) {
      if (!controls[key]) {
        controls[key] = control;
      }
    }
  }

  const config: ExternalEntityConfig = {
    name: manifest.name,
    label: manifest.label,
    description: manifest.description ?? '',
    type: manifest.type,
    external: true,
    icon: manifest.icon ? installed.files[manifest.icon] : undefined,
    module: {
      url: installed.sourceUrl,
      version: manifest.version,
      runtime: manifest.runtime,
    },
    defaultProperties: isEffect
      ? { ...manifest.defaultProperties }
      : { ...STANDARD_DISPLAY_PROPERTIES, ...manifest.defaultProperties },
    controls,
  };

  class ExternalEntity extends Base {
    static config = config;

    constructor(properties?: Record<string, unknown>) {
      super(ExternalEntity, properties);
    }

    toJSON(): Record<string, unknown> {
      // Record provenance so projects can offer to reinstall a missing module.
      return {
        ...super.toJSON(),
        module: {
          url: installed.sourceUrl,
          version: manifest.version,
        },
      };
    }
  }

  return ExternalEntity as unknown as LibraryEntityClass;
}
