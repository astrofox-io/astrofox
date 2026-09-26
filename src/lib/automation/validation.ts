import { library, stage } from '@/app/global';
import AudioReactor from '@/lib/audio/AudioReactor';
import type Entity from '@/lib/core/Entity';
import Scene from '@/lib/core/Scene';
import { resolve } from '@/lib/utils/object';

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

export function assertSafe(value: unknown, depth = 0): void {
  if (depth > 25) throw new Error('Object nesting exceeds 25 levels.');
  if (typeof value === 'number' && !Number.isFinite(value))
    throw new Error('Numbers must be finite.');
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key))
        throw new Error(`Forbidden property: ${key}`);
      assertSafe(entry, depth + 1);
    }
  }
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

function checkShape(value: unknown, reference: unknown, key: string) {
  if (reference === null) {
    if (value !== null && typeof value !== 'string' && typeof value !== 'number')
      throw new Error(`Invalid ${key}.`);
  } else if (Array.isArray(reference)) {
    if (
      !Array.isArray(value) ||
      value.length > 256 ||
      (reference.length > 0 && value.length !== reference.length)
    )
      throw new Error(`${key} must be an array matching the default shape.`);
    for (const item of value) if (reference.length) checkShape(item, reference[0], key);
  } else if (typeof reference === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error(`${key} must be an object.`);
    const shape = reference as Record<string, unknown>;
    if (Object.keys(shape).some(name => !Object.hasOwn(value, name)))
      throw new Error(`${key} must include all fields.`);
    for (const [name, entry] of Object.entries(value)) {
      if (!Object.hasOwn(shape, name)) throw new Error(`Unknown field ${key}.${name}`);
      checkShape(entry, shape[name], `${key}.${name}`);
    }
  } else if (typeof value !== typeof reference) {
    throw new Error(`${key} must be ${typeof reference}.`);
  }
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

/** Reject executable-object overrides and malformed graphs before replacing live state. */
export function validateSnapshot(snapshot: Record<string, unknown>) {
  assertSafe(snapshot);
  const ids = new Set<string>();
  const allowed = new Set([
    'id',
    'name',
    'type',
    'enabled',
    'displayName',
    'properties',
    'reactors',
    'plugin',
    'displays',
    'effects',
  ]);
  function visit(value: unknown, kind: 'scene' | 'display' | 'effect' | 'reactor') {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid project entity.');
    const entity = value as Record<string, unknown>;
    if (typeof entity.id !== 'string' || !entity.id || ids.has(entity.id))
      throw new Error('Project entity IDs must be unique nonempty strings.');
    ids.add(entity.id);
    if (ids.size > 2000) throw new Error('Project exceeds 2000 entities.');
    for (const key of Object.keys(entity))
      if (!allowed.has(key)) throw new Error(`Unsupported entity field: ${key}`);
    if (entity.enabled !== undefined && typeof entity.enabled !== 'boolean')
      throw new Error('Invalid enabled flag.');
    if (entity.displayName !== undefined && typeof entity.displayName !== 'string')
      throw new Error('Invalid display name.');
    if (entity.type !== undefined && entity.type !== (kind === 'scene' ? 'display' : kind))
      throw new Error('Invalid entity type.');
    if (
      !entity.properties ||
      typeof entity.properties !== 'object' ||
      Array.isArray(entity.properties)
    )
      throw new Error('Invalid entity properties.');
    if (kind === 'scene') {
      for (const key of ['displays', 'effects'] as const) {
        if (entity[key] === undefined) entity[key] = [];
        if (!Array.isArray(entity[key])) throw new Error(`Invalid scene ${key}.`);
        for (const child of entity[key]) visit(child, key === 'displays' ? 'display' : 'effect');
      }
    } else if (entity.displays || entity.effects)
      throw new Error('Only scenes may contain elements.');
    const name =
      kind === 'scene' ? 'Scene' : kind === 'reactor' ? 'AudioReactor' : String(entity.name);
    const types = getTypes();
    const Type = Object.hasOwn(types, name) ? types[name] : undefined;
    if (Type && kind !== 'scene' && kind !== 'reactor' && Type.config.type !== kind)
      throw new Error(`Wrong entity collection for ${name}.`);
    // Saved properties can exceed current UI bounds (for example after a canvas
    // resize), but must retain the expected data shapes before constructors run.
    if (Type)
      for (const [key, value] of Object.entries(entity.properties)) {
        if (Object.hasOwn(Type.config.defaultProperties, key))
          checkShape(value, Type.config.defaultProperties[key], key);
      }
    if (entity.reactors !== undefined) {
      if (!entity.reactors || typeof entity.reactors !== 'object' || Array.isArray(entity.reactors))
        throw new Error('Invalid reactor bindings.');
      for (const binding of Object.values(entity.reactors)) {
        const b = binding as { id?: unknown; min?: unknown; max?: unknown };
        if (
          !b ||
          typeof b.id !== 'string' ||
          typeof b.min !== 'number' ||
          typeof b.max !== 'number'
        )
          throw new Error('Invalid reactor binding.');
      }
    }
  }
  if (snapshot.scenes === undefined) snapshot.scenes = [];
  if (snapshot.reactors === undefined) snapshot.reactors = [];
  if (!Array.isArray(snapshot.scenes) || !Array.isArray(snapshot.reactors))
    throw new Error('Project requires scenes and reactors arrays.');
  for (const scene of snapshot.scenes) visit(scene, 'scene');
  for (const reactor of snapshot.reactors) visit(reactor, 'reactor');
  const props = (snapshot.stage as { properties?: Record<string, unknown> })?.properties;
  if (props) {
    for (const key of ['width', 'height'])
      if (!Number.isInteger(props[key]) || Number(props[key]) < 16 || Number(props[key]) > 7680)
        throw new Error('Invalid project canvas dimensions.');
    if (Number(props.width) * Number(props.height) > 33_177_600)
      throw new Error('Project exceeds 8K pixel budget.');
    if (typeof props.backgroundColor !== 'string' || !CSS.supports('color', props.backgroundColor))
      throw new Error('Invalid project background color.');
  }
}
