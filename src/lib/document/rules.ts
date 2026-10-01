import { validateClipFields } from '@/lib/timeline/clip';
import {
  isValidFps,
  isValidProjectDuration,
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  TIMELINE_FPS_OPTIONS,
} from '@/lib/timeline/settings';
import { assertSafe } from '@/lib/utils/object';
import type { Canvas, LoadInput } from './types';

/**
 * What a Document may hold. `apply` refuses an op that would break these, and
 * `load` (and `check`) a document that does, whoever sends it: the UI, MCP or
 * a project file.
 */

/** Canvas size limits, in pixels. */
export const CANVAS_LIMITS = {
  minSize: 16,
  maxSize: 7680,
  /** 7680 × 4320: an 8K frame. */
  maxPixels: 33_177_600,
} as const;

/** The parts of a layer type the rules read. */
export interface RuleType {
  config: { type?: string; defaultProperties: Record<string, unknown> };
}

export interface RuleContext {
  /** The class for a layer or reactor name, when it is installed. */
  resolveType(name: string): RuleType | undefined;
  isColor(value: string): boolean;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isHexColor(value: string) {
  return HEX_COLOR.test(value);
}

export function checkCanvas(canvas: Canvas, isColor: (value: string) => boolean = isHexColor) {
  const { minSize, maxSize, maxPixels } = CANVAS_LIMITS;

  for (const key of ['width', 'height'] as const) {
    const value = canvas[key];
    if (!Number.isInteger(value) || value < minSize || value > maxSize) {
      throw new Error(`Canvas ${key} must be a whole number from ${minSize} to ${maxSize}.`);
    }
  }

  if (canvas.width * canvas.height > maxPixels) {
    throw new Error('Canvas exceeds the 8K pixel budget.');
  }

  if (typeof canvas.backgroundColor !== 'string' || !isColor(canvas.backgroundColor)) {
    throw new Error('Invalid canvas background color.');
  }
}

export function checkTimeline({ duration, fps }: { duration: unknown; fps: unknown }) {
  if (duration !== null && !isValidProjectDuration(duration)) {
    throw new Error(
      `Project duration must be between ${MIN_PROJECT_DURATION} and ${MAX_PROJECT_DURATION} seconds.`,
    );
  }

  if (!isValidFps(fps)) {
    throw new Error(`Frame rate must be one of ${TIMELINE_FPS_OPTIONS.join(', ')}.`);
  }
}

/** A value must keep the shape of the property's default before a constructor sees it. */
export function checkShape(value: unknown, reference: unknown, key: string) {
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

const ENTITY_FIELDS = new Set([
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
  'clip',
]);

type Kind = 'scene' | 'display' | 'effect' | 'reactor';

/**
 * Check a whole document before it replaces the current one: well-formed
 * scenes, layers and reactors with unique ids, property values in the shape
 * their type expects, valid clips, bindings, timeline and canvas. Saved values
 * may exceed the current UI bounds (after a canvas resize, say); only their
 * shape is checked.
 */
export function checkLoadInput(input: LoadInput, context: RuleContext) {
  assertSafe(input);
  const ids = new Set<string>();

  function visit(value: unknown, kind: Kind) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Invalid project entity.');
    const entity = value as Record<string, unknown>;
    if (typeof entity.id !== 'string' || !entity.id || ids.has(entity.id))
      throw new Error('Project entity IDs must be unique nonempty strings.');
    ids.add(entity.id);
    for (const key of Object.keys(entity))
      if (!ENTITY_FIELDS.has(key)) throw new Error(`Unsupported entity field: ${key}`);
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
        const children = entity[key] ?? [];
        if (!Array.isArray(children)) throw new Error(`Invalid scene ${key}.`);
        for (const child of children) visit(child, key === 'displays' ? 'display' : 'effect');
      }
    } else if (entity.displays || entity.effects) {
      throw new Error('Only scenes may contain elements.');
    }

    const name =
      kind === 'scene' ? 'Scene' : kind === 'reactor' ? 'AudioReactor' : String(entity.name);
    const Type = context.resolveType(name);
    if (Type && (kind === 'display' || kind === 'effect') && Type.config.type !== kind)
      throw new Error(`Wrong entity collection for ${name}.`);
    if (Type) {
      for (const [key, property] of Object.entries(entity.properties)) {
        if (Object.hasOwn(Type.config.defaultProperties, key))
          checkShape(property, Type.config.defaultProperties[key], key);
      }
    }

    if (entity.clip !== undefined && entity.clip !== null) {
      validateClipFields(entity.clip);
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

  const scenes = input.scenes ?? [];
  const reactors = input.reactors ?? [];
  if (!Array.isArray(scenes) || !Array.isArray(reactors))
    throw new Error('Project requires scenes and reactors arrays.');
  for (const scene of scenes) visit(scene, 'scene');
  for (const reactor of reactors) visit(reactor, 'reactor');

  if (input.timeline !== undefined && input.timeline !== null) {
    const timeline = input.timeline as Record<string, unknown>;
    if (typeof timeline !== 'object' || Array.isArray(timeline))
      throw new Error('Invalid timeline settings.');
    for (const key of Object.keys(timeline))
      if (!['duration', 'fps'].includes(key)) throw new Error(`Unsupported timeline field: ${key}`);
    if (
      timeline.duration !== undefined &&
      timeline.duration !== null &&
      !isValidProjectDuration(timeline.duration)
    )
      throw new Error('Invalid project duration.');
    if (timeline.fps !== undefined && !isValidFps(timeline.fps))
      throw new Error('Invalid project frame rate.');
  }
}
