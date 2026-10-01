import { library, stage } from '@/app/global';
import AudioReactor from '@/lib/audio/AudioReactor';
import type Entity from '@/lib/core/Entity';
import Scene from '@/lib/core/Scene';
import { checkShape } from '@/lib/document/rules';
import { assertSafe, resolve } from '@/lib/utils/object';

export interface EntityType {
  new (properties?: Record<string, unknown>): Entity;
  config: {
    name: string;
    label?: string;
    description?: string;
    type?: string;
    media?: string;
    defaultProperties: Record<string, unknown>;
    controls?: Record<string, Record<string, unknown>>;
  };
}

export function getTypes(): Record<string, EntityType> {
  return { ...library.get('displays'), ...library.get('effects'), Scene, AudioReactor };
}

export function getType(name: string) {
  const types = getTypes();
  if (!Object.hasOwn(types, name)) throw new Error(`Unknown element type: ${name}`);
  return types[name];
}

export function resolvedControls(Type: EntityType, context?: object) {
  const target = context || {
    properties: Type.config.defaultProperties,
    scene: stage,
    image: { naturalWidth: 0, naturalHeight: 0 },
    video: { videoWidth: 0, videoHeight: 0 },
    hasVideo: false,
  };
  return Object.fromEntries(
    Object.entries(Type.config.controls || {}).map(([name, control]) => [
      name,
      Object.fromEntries(
        Object.entries(control).map(([key, value]) => [key, resolve(value, [target])]),
      ),
    ]),
  );
}

export function validateProperties(
  Type: EntityType,
  values: Record<string, unknown>,
  entity?: Entity,
  allowMedia = false,
) {
  assertSafe(values);
  const defaults = Type.config.defaultProperties;
  const proposed = { ...defaults, ...entity?.properties, ...values };
  const context = Object.create(
    entity || {
      image: { naturalWidth: 0, naturalHeight: 0 },
      video: { videoWidth: 0, videoHeight: 0 },
      hasVideo: false,
    },
    {
      properties: { value: proposed },
      scene: { value: entity?.scene || stage },
    },
  );
  const controls = resolvedControls(Type, context);
  for (const [key, value] of Object.entries(values)) {
    if (!Object.hasOwn(defaults, key))
      throw new Error(`Unknown property ${Type.config.name}.${key}`);
    if (!allowMedia && ['src', 'sourcePath'].includes(key))
      throw new Error('Use load_media to assign local media.');
    if (
      !allowMedia &&
      !Object.hasOwn(controls, key) &&
      !(Type === AudioReactor && ['selection', 'range', 'historySize'].includes(key))
    )
      throw new Error(`${key} is not an editable control.`);
    checkShape(value, defaults[key], key);
    const control = controls[key];
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) > 1e8)
        throw new Error(`${key} is outside the supported numeric range.`);
      if (typeof control?.min === 'number' && value < control.min)
        throw new Error(`${key} must be >= ${control.min}.`);
      if (typeof control?.max === 'number' && value > control.max)
        throw new Error(`${key} must be <= ${control.max}.`);
    }
    if (typeof value === 'string' && value.length > 100_000 && !allowMedia)
      throw new Error(`${key} is too long.`);
    if (control?.type === 'color' && typeof value === 'string' && !CSS.supports('color', value))
      throw new Error(`${key} must be a valid color.`);
    if (
      typeof control?.type === 'string' &&
      control.type.includes('color') &&
      Array.isArray(value) &&
      value.some(color => typeof color !== 'string' || !CSS.supports('color', color))
    )
      throw new Error(`${key} must contain valid colors.`);
    if (control?.type === 'select' && Array.isArray(control.items)) {
      const choices = control.items
        .filter(item => item !== null)
        .map(item => (typeof item === 'object' ? item.value : item));
      if (!choices.includes(value)) throw new Error(`${key} must be one of: ${choices.join(', ')}`);
    }
  }
  if (Type === AudioReactor) {
    for (const key of ['x1', 'x2', 'y1', 'y2']) {
      const value = (proposed.range as Record<string, number>)[key];
      if (value < 0 || value > 1) throw new Error(`range.${key} must be between 0 and 1.`);
    }
    const range = proposed.range as Record<string, number>;
    if (range.x1 > range.x2 || range.y1 > range.y2)
      throw new Error('Reactor range endpoints must be ordered.');
    if (
      !Number.isInteger(proposed.historySize) ||
      Number(proposed.historySize) < 1 ||
      Number(proposed.historySize) > 4096
    )
      throw new Error('historySize must be an integer from 1 to 4096.');
  }
}

/** MCP opens projects of at most this many scenes, layers and reactors. */
const MAX_ENTITIES = 2000;

/**
 * MCP's own limit on an opened project. Whether it is a valid project is the
 * Document's to decide (`checkLoadInput` in src/lib/document/rules.ts).
 */
export function validateSnapshot(snapshot: Record<string, unknown>) {
  let count = 0;
  const scenes = Array.isArray(snapshot.scenes) ? snapshot.scenes : [];
  const reactors = Array.isArray(snapshot.reactors) ? snapshot.reactors : [];

  for (const scene of scenes as Record<string, unknown>[]) {
    count += 1;
    for (const key of ['displays', 'effects']) {
      if (Array.isArray(scene?.[key])) count += (scene[key] as unknown[]).length;
    }
  }

  if (count + reactors.length > MAX_ENTITIES) {
    throw new Error(`Project exceeds ${MAX_ENTITIES} entities.`);
  }
}
