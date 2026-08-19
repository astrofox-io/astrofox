import Display from '@/lib/core/Display';
import Effect from '@/lib/core/Effect';
import { CAMERA_3D_DEFAULTS, camera3DControls } from '@/lib/displays/shared/display3DConfig';
import { stageHeight, stageWidth } from '@/lib/utils/controls';
import { resolveManifestControls } from './resolveControls';
import type { ExternalEntityConfig, InstalledPlugin, LibraryEntityClass } from './types';

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
      label: 'Scale',
      type: 'number',
      min: 1,
      max: 10,
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
 * plugin. Instances behave exactly like core entities (properties, reactors,
 * serialization); rendering is provided separately by the runtime the plugin
 * declares (shader pass factory or worker layer).
 */
export function createExternalEntityClass(installed: InstalledPlugin): LibraryEntityClass {
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

  // Camera-enabled displays get the host's camera block so the stage orbit
  // controls and the control panel work exactly like the core 3D displays.
  const hasCamera = !isEffect && manifest.camera === true;
  if (hasCamera) {
    for (const [key, control] of Object.entries(camera3DControls)) {
      if (!controls[key]) {
        controls[key] = control as Record<string, unknown>;
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
    plugin: {
      url: installed.sourceUrl,
      version: manifest.version,
      runtime: manifest.runtime,
    },
    defaultProperties: isEffect
      ? { ...manifest.defaultProperties }
      : {
          ...STANDARD_DISPLAY_PROPERTIES,
          ...(hasCamera ? CAMERA_3D_DEFAULTS : {}),
          ...manifest.defaultProperties,
        },
    controls,
  };

  class ExternalEntity extends Base {
    static config = config;

    constructor(properties?: Record<string, unknown>) {
      super(ExternalEntity, properties);
    }

    toJSON(): Record<string, unknown> {
      // Record provenance so projects can offer to reinstall a missing plugin.
      return {
        ...super.toJSON(),
        plugin: {
          url: installed.sourceUrl,
          version: manifest.version,
        },
      };
    }
  }

  return ExternalEntity as unknown as LibraryEntityClass;
}
