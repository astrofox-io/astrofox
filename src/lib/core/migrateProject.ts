/**
 * Backward-compatible migration of saved project snapshots.
 *
 * Handles legacy v1.x `.afx` projects and pre-release v2 files by renaming
 * elements/properties to their current names, rescaling values into the
 * current control ranges and remapping audio reactor bindings accordingly.
 * Finally, for built-in displays/effects, any property keys or reactor
 * bindings that the current class no longer knows about are stripped so
 * stale keys don't get merged back into `defaultProperties`.
 *
 * All migrations are idempotent and safe to run on current-format files.
 */

import type { ReactorConfig } from '@/lib/types';

type Properties = Record<string, unknown>;
type Reactors = Record<string, ReactorConfig>;

export interface ElementSnapshot extends Record<string, unknown> {
  id: string;
  name?: string;
  displayName?: string;
  properties?: Properties;
  reactors?: Reactors;
  plugin?: { url?: string };
}

export interface SceneSnapshot extends Record<string, unknown> {
  displays?: ElementSnapshot[];
  effects?: ElementSnapshot[];
}

export interface ProjectSnapshot extends Record<string, unknown> {
  version?: string;
  stage?: { properties?: Properties };
  scenes?: SceneSnapshot[];
  reactors?: Record<string, unknown>[];
}

export interface MigrationComponent {
  config?: {
    builtin?: boolean;
    defaultProperties?: Properties;
  };
}

export interface MigrationRegistry {
  displays?: Record<string, MigrationComponent>;
  effects?: Record<string, MigrationComponent>;
}

export interface MigrationResult {
  snapshot: ProjectSnapshot;
  /** Human-readable names of elements that could not be migrated and were dropped. */
  removed: string[];
}

interface ReactorRemap {
  /** Target property key (defaults to the source key). */
  key?: string;
  /** Transform applied to both `min` and `max` of the binding. */
  value?: (value: number) => number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const round = (value: number, digits = 4) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toNumber = (value: unknown, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isPluginName = (name = '') => name.startsWith('@');

/**
 * Rename properties and reactor bindings on an element in place.
 * `map` describes source key -> { key, value } remapping. Keys not listed
 * are left untouched.
 */
function remapElement(
  element: ElementSnapshot,
  map: Record<string, ReactorRemap & { property?: (value: unknown, props: Properties) => unknown }>,
) {
  const properties = { ...(element.properties ?? {}) };
  const reactors: Reactors = { ...(element.reactors ?? {}) };

  for (const [source, remap] of Object.entries(map)) {
    const target = remap.key ?? source;

    if (source in properties) {
      const value = properties[source];
      delete properties[source];
      properties[target] = remap.property ? remap.property(value, properties) : value;
    }

    if (source in reactors) {
      const binding = reactors[source];
      delete reactors[source];

      if (binding && typeof binding === 'object') {
        const transform = remap.value;
        let min = toNumber(binding.min, 0);
        let max = toNumber(binding.max, 1);

        if (transform) {
          min = transform(min);
          max = transform(max);
        }

        reactors[target] = { ...binding, min, max };
      }
    }
  }

  element.properties = properties;
  element.reactors = reactors;
}

/** Bind an existing reactor to additional keys (used when one legacy control fans out). */
function duplicateReactor(element: ElementSnapshot, source: string, targets: string[]) {
  const reactors = element.reactors ?? {};
  const binding = reactors[source];

  if (!binding) {
    return;
  }

  for (const target of targets) {
    if (!(target in reactors)) {
      reactors[target] = { ...binding };
    }
  }

  element.reactors = reactors;
}

// ---------------------------------------------------------------------------
// Element-specific migrations
// ---------------------------------------------------------------------------

/**
 * v1 GlowEffect { amount 0..1, intensity 1..3 } -> BloomEffect
 * { exposure, strength 0..3, radius 0..1, threshold }.
 */
function migrateGlowEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};

  element.name = 'BloomEffect';
  element.properties = {
    exposure: 1,
    threshold: 0,
    ...props,
  };

  remapElement(element, {
    amount: { key: 'radius', value: v => clamp(v, 0, 1) },
    intensity: { key: 'strength', value: v => clamp(v, 0, 3) },
  });

  if (/^Glow(\s\d+)?$/.test(String(element.displayName ?? ''))) {
    element.displayName = String(element.displayName).replace(/^Glow/, 'Bloom');
  }
}

/**
 * v1 BloomEffect { blendMode, amount 0..1, threshold 0..1 (lum = 1 - threshold) }
 * -> v2 { exposure, strength 0..3, radius, threshold }.
 */
function migrateLegacyBloomEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};
  const isLegacy = 'amount' in props && !('strength' in props);

  if (!isLegacy) {
    return;
  }

  remapElement(element, {
    amount: {
      key: 'strength',
      value: v => round(clamp(v * 3, 0, 3)),
      property: v => round(clamp(toNumber(v, 0.1) * 3, 0, 3)),
    },
    threshold: {
      key: 'threshold',
      value: v => round(clamp(1 - v, 0, 1)),
      property: v => round(clamp(1 - toNumber(v, 1), 0, 1)),
    },
  });

  const next = element.properties ?? {};
  delete next.blendMode;

  const reactors = element.reactors ?? {};
  // Threshold was inverted; keep min <= max after the flip.
  const thresholdReactor = reactors.threshold;
  if (thresholdReactor && thresholdReactor.min > thresholdReactor.max) {
    reactors.threshold = {
      ...thresholdReactor,
      min: thresholdReactor.max,
      max: thresholdReactor.min,
    };
  }
  delete reactors.blendMode;

  element.properties = { exposure: 1, radius: 0, ...next };
  element.reactors = reactors;
}

/**
 * v1 ColorHalftoneEffect { scale 0..1, angle 0..360 } ->
 * v2 { radius 1..25, rotateR/G/B 0..90 }.
 *
 * The v1 shader used a frequency of (1 - scale) so the dot period was
 * roughly PI / (1 - scale) px; radius ~= half of that.
 */
function migrateColorHalftoneEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};
  const isLegacy = 'scale' in props || 'angle' in props;

  if (!isLegacy) {
    return;
  }

  const scaleToRadius = (scale: number) =>
    clamp(Math.round(Math.PI / (2 * Math.max(1 - scale, 0.01))), 1, 25);
  const wrapAngle = (angle: number) => ((angle % 90) + 90) % 90;

  const angle = toNumber(props.angle, 0);
  const hasAngle = 'angle' in props;

  remapElement(element, {
    scale: {
      key: 'radius',
      value: v => scaleToRadius(v),
      property: v => scaleToRadius(toNumber(v, 0.5)),
    },
    angle: {
      key: 'rotateB',
      value: v => clamp(v, 0, 90),
      property: v => wrapAngle(toNumber(v, 0)),
    },
  });

  const next = element.properties ?? {};

  if (hasAngle) {
    next.rotateR = wrapAngle(angle + 15);
    next.rotateG = wrapAngle(angle + 75);
    duplicateReactor(element, 'rotateB', ['rotateR', 'rotateG']);
  }

  element.properties = next;
}

/** v1 GlitchEffect { amount 0..1 } -> v2 { strength 0..1 }. */
function migrateGlitchEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};

  if (!('amount' in props) || 'strength' in props) {
    return;
  }

  remapElement(element, {
    amount: { key: 'strength', value: v => clamp(v, 0, 1) },
  });
}

/**
 * v1 GeometryDisplay { lightIntensity, lightDistance, cameraZoom } ->
 * v2 { keyLightIntensity, keyLightDistance, cameraDistance, lighting: true }.
 */
function migrateGeometryDisplay(element: ElementSnapshot) {
  const props = element.properties ?? {};
  const legacyKeys = ['lightIntensity', 'lightDistance', 'cameraZoom'];
  const hasLegacy = legacyKeys.some(key => key in props);

  if (!hasLegacy) {
    return;
  }

  remapElement(element, {
    lightIntensity: { key: 'keyLightIntensity', value: v => clamp(v, 0, 4) },
    lightDistance: { key: 'keyLightDistance', value: v => clamp(v, 50, 2500) },
    cameraZoom: { key: 'cameraDistance', value: v => clamp(v, 0, 5000) },
  });

  const next = element.properties ?? {};

  if (!('lighting' in next)) {
    next.lighting = true;
  }

  element.properties = next;
}

/** Pre-release DistortionEffect mode 'Noise' -> 'Simplex Noise'. */
function migrateDistortionEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};

  if (props.mode === 'Noise') {
    props.mode = 'Simplex Noise';
  }

  element.properties = props;
}

/** Pre-release PerlinNoiseEffect -> DistortionEffect with mode 'Perlin Noise'. */
function migratePerlinNoiseEffect(element: ElementSnapshot) {
  const props = element.properties ?? {};

  element.name = 'DistortionEffect';
  element.properties = {
    time: 0,
    ...props,
    mode: 'Perlin Noise',
    amount: clamp(toNumber(props.amount, 0.35), 0, 1),
    scale: clamp(toNumber(props.scale, 3), 0.5, 10),
    speed: clamp(toNumber(props.speed, 0.25), 0, 1),
  };

  remapElement(element, {
    amount: { value: v => clamp(v, 0, 1) },
    scale: { value: v => clamp(v, 0.5, 10) },
    speed: { value: v => clamp(v, 0, 1) },
  });

  if (/^Perlin Noise(\s\d+)?$/.test(String(element.displayName ?? ''))) {
    element.displayName = String(element.displayName).replace(/^Perlin Noise/, 'Distortion');
  }
}

const elementMigrations: Record<string, (element: ElementSnapshot) => void> = {
  GlowEffect: migrateGlowEffect,
  BloomEffect: migrateLegacyBloomEffect,
  ColorHalftoneEffect: migrateColorHalftoneEffect,
  GlitchEffect: migrateGlitchEffect,
  GeometryDisplay: migrateGeometryDisplay,
  DistortionEffect: migrateDistortionEffect,
  PerlinNoiseEffect: migratePerlinNoiseEffect,
};

// ---------------------------------------------------------------------------
// Generic cleanup
// ---------------------------------------------------------------------------

function findComponent(name: string, registry: MigrationRegistry): MigrationComponent | undefined {
  return registry.displays?.[name] ?? registry.effects?.[name];
}

/**
 * Drop unknown property keys and reactor bindings for built-in components.
 * Plugin components (or anything not in the registry) are left untouched.
 */
function stripUnknownKeys(element: ElementSnapshot, registry: MigrationRegistry) {
  const name = element.name ?? '';

  if (!name || isPluginName(name) || element.plugin?.url) {
    return;
  }

  const component = findComponent(name, registry);
  const defaults = component?.config?.defaultProperties;

  if (!component || !defaults || component.config?.builtin === false) {
    return;
  }

  const known = new Set(Object.keys(defaults));

  if (element.properties) {
    const properties: Properties = {};
    for (const [key, value] of Object.entries(element.properties)) {
      if (known.has(key)) {
        properties[key] = value;
      }
    }
    element.properties = properties;
  }

  if (element.reactors) {
    const reactors: Reactors = {};
    for (const [key, value] of Object.entries(element.reactors)) {
      if (known.has(key) && value && typeof value === 'object') {
        reactors[key] = value;
      }
    }
    element.reactors = reactors;
  }
}

function describeElement(element: ElementSnapshot, kind: 'display' | 'effect') {
  const label = element.displayName || element.name || (kind === 'display' ? 'Layer' : 'Effect');
  return element.name && element.displayName && element.name !== element.displayName
    ? `${label} (${element.name})`
    : String(label);
}

function migrateElement(
  element: ElementSnapshot,
  kind: 'display' | 'effect',
  registry: MigrationRegistry,
  removed: string[],
): ElementSnapshot | null {
  if (!isRecord(element)) {
    return null;
  }

  const next: ElementSnapshot = {
    ...element,
    properties: isRecord(element.properties) ? { ...element.properties } : {},
    reactors: isRecord(element.reactors) ? ({ ...element.reactors } as Reactors) : {},
  };

  // Element-specific migrations may rename the component, so loop until stable.
  const seen = new Set<string>();
  while (next.name && elementMigrations[next.name] && !seen.has(next.name)) {
    seen.add(next.name);
    elementMigrations[next.name](next);
  }

  const name = next.name ?? '';
  const known = !!findComponent(name, registry);
  const hasRegistry = !!(registry.displays || registry.effects);

  if (hasRegistry && !known && !isPluginName(name) && !next.plugin?.url) {
    // A built-in component that no longer exists and has no migration path.
    removed.push(describeElement(next, kind));
    return null;
  }

  stripUnknownKeys(next, registry);

  return next;
}

/**
 * Migrate a project snapshot to the current format.
 *
 * @param snapshot Raw project snapshot (v1 root object or v2 `snapshot`).
 * @param version  Version string recorded in the file (informational).
 * @param registry Component registry used to validate names/properties. When
 *                 omitted no elements are removed and no keys are stripped.
 */
export function migrateProjectSnapshot(
  snapshot: ProjectSnapshot,
  version?: string,
  registry: MigrationRegistry = {},
): MigrationResult {
  const removed: string[] = [];

  if (!isRecord(snapshot)) {
    return { snapshot, removed };
  }

  const scenes = Array.isArray(snapshot.scenes)
    ? snapshot.scenes.map(scene => {
        if (!isRecord(scene)) {
          return scene;
        }

        const displays = Array.isArray(scene.displays)
          ? scene.displays
              .map(display => migrateElement(display, 'display', registry, removed))
              .filter((display): display is ElementSnapshot => display !== null)
          : scene.displays;

        const effects = Array.isArray(scene.effects)
          ? scene.effects
              .map(effect => migrateElement(effect, 'effect', registry, removed))
              .filter((effect): effect is ElementSnapshot => effect !== null)
          : scene.effects;

        return { ...scene, displays, effects };
      })
    : snapshot.scenes;

  return {
    snapshot: {
      ...snapshot,
      version: snapshot.version ?? version,
      scenes,
    },
    removed,
  };
}
