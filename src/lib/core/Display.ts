import Entity from '@/lib/core/Entity';
import { type Clip, clipEnvelope, isClipActive, normalizeClip } from '@/lib/timeline/clip';
import { cloneTracks, evaluateTrack, type Keyframe, type Tracks } from '@/lib/timeline/tracks';
import type { ReactorConfig, RenderFrameData } from '@/lib/types';
import { getDisplayName } from '@/lib/utils/controls';
import { resolve, updateExistingProps } from '@/lib/utils/object';

/**
 * How the stage transform overlay should treat a display. Declared on the
 * display's static config as `transform` so the overlay never has to test
 * display names; everything is optional and defaults to a plain resizable box.
 */
export interface DisplayTransformConfig {
  // Which handle set the overlay draws.
  kind?: 'size' | 'text' | 'radialSpectrum' | 'waveformRing';
  // Whether resizing keeps the aspect ratio (subject to the `fixed` property).
  fixedAspect?: boolean | ((properties: Record<string, unknown>) => boolean);
  // Intrinsic media size used when width/height properties are 0.
  naturalSize?: (display: Display) => { width: number; height: number } | null;
  // When it returns false the overlay draws no handles (e.g. empty text).
  hasContent?: (properties: Record<string, unknown>) => boolean;
  // The editable height is height + shadowHeight and both scale together.
  heightIncludesShadow?: boolean;
}

export function getDisplayTransformConfig(display: unknown): DisplayTransformConfig {
  const config = (display as { constructor?: { config?: { transform?: DisplayTransformConfig } } })
    ?.constructor?.config;
  return config?.transform ?? {};
}

/**
 * The values a person (or MCP client) set, as opposed to the runtime values a
 * frame is rendered with. Entities without the split (reactors) have only one.
 */
export function getAuthoredProperties(entity: Entity): Record<string, unknown> {
  const authored = (entity as { authoredProperties?: Record<string, unknown> }).authoredProperties;
  return authored ?? (entity.properties as Record<string, unknown>);
}

// Greater than zero while `evaluate()` is pushing runtime values through
// `update()`, so those writes do not become authored values.
let evaluating = 0;

/**
 * Base class for scenes, displays and effects.
 *
 * Properties exist in two layers:
 * - `authoredProperties`: what was edited. Saved in the project, shown in the
 *   controls panel, tracked by undo.
 * - `properties`: the runtime values renderers read. Recomputed every frame by
 *   `evaluate()` from the authored values, keyframe tracks, reactor output
 *   and the clip fade envelope. Runtime values never leak back into the
 *   authored layer.
 *
 * Subclasses keep overriding `update()` for side effects (canvas re-render,
 * media loading); it runs for both authoring and per-frame evaluation.
 */
export default class Display extends Entity {
  [key: string]: unknown;

  static create = (
    Type: new (properties?: Record<string, unknown>) => Entity,
    config: Record<string, unknown>,
  ) => {
    const {
      reactors = {},
      clip,
      tracks,
    } = config as {
      reactors?: Record<string, ReactorConfig>;
      clip?: unknown;
      tracks?: Tracks;
    };
    const entity = Entity.create(Type, config) as Display;

    for (const [key, value] of Object.entries(reactors)) {
      entity.setReactor(key, value);
    }

    entity.setClip(clip);
    entity.tracks = cloneTracks(tracks);

    return entity;
  };

  declare type: string;
  declare displayName: string;
  declare enabled: boolean;
  declare scene: unknown;
  declare reactors: Record<string, ReactorConfig>;
  declare authoredProperties: Record<string, unknown>;
  declare clip: Clip | null;
  /** Keyframe tracks by property. Checked by the Document before they get here. */
  declare tracks: Tracks;

  constructor(
    Type: {
      config: {
        name: string;
        label: string;
        defaultProperties: Record<string, unknown>;
      };
    },
    properties?: Record<string, unknown>,
  ) {
    const {
      config: { name, label, defaultProperties },
    } = Type;

    super(name, { ...defaultProperties, ...properties });

    Object.defineProperties(this, {
      type: { value: 'display', writable: true, enumerable: true },
      displayName: {
        value: getDisplayName(label),
        writable: true,
        enumerable: true,
      },
      enabled: { value: true, writable: true, enumerable: true },
      scene: { value: null, writable: true, enumerable: true },
      reactors: { value: {}, writable: true, enumerable: true },
      clip: { value: null, writable: true, enumerable: true },
      tracks: { value: {}, writable: true, enumerable: true },
      authoredProperties: { value: { ...this.properties }, writable: true, enumerable: false },
    });
  }

  /**
   * Apply property values. Outside of frame evaluation this is an authoring
   * change and is recorded in `authoredProperties` too.
   */
  update(properties: Record<string, unknown> = {}): boolean {
    const resolved = resolve(properties, [this.properties]) as Record<string, unknown>;
    const changed = updateExistingProps(this.properties, resolved);

    if (evaluating === 0) {
      return updateExistingProps(this.authoredProperties, resolved) || changed;
    }

    return changed;
  }

  getReactor(prop: string): ReactorConfig | undefined {
    return this.reactors[prop];
  }

  setReactor(prop: string, config: ReactorConfig) {
    // Keep only binding fields, including when loading older project files.
    this.reactors[prop] = { id: config.id, min: config.min, max: config.max };
  }

  removeReactor(prop: string) {
    delete this.reactors[prop];
  }

  clearReactors() {
    this.reactors = {} as Record<string, ReactorConfig>;
  }

  setClip(clip: unknown) {
    this.clip = normalizeClip(clip);
  }

  /** Replace a property's keys; null or none makes the property static. */
  setTrack(property: string, type: Tracks[string]['type'], keyframes: Keyframe[] | null) {
    if (!keyframes || keyframes.length === 0) {
      delete this.tracks[property];
      return;
    }

    this.tracks[property] = { type, keyframes: keyframes.map(key => ({ ...key })) };
  }

  /**
   * Recompute runtime properties for a frame: the authored value, or the
   * keyframe track's value at the frame time; then reactor output scaled to
   * the binding's range; then `opacity` scaled by the clip fade envelope, last, so
   * fades apply whatever drives opacity. Only values that differ from the
   * current runtime values go through `update()`, exactly as reactor updates
   * always did.
   */
  evaluate(frameData: RenderFrameData) {
    const { time, duration } = frameData;
    const { clip, authoredProperties, properties, reactors, tracks } = this;
    const active = isClipActive(clip, time, duration);

    const envelope = clip && active ? clipEnvelope(clip, time, duration) : 1;
    let next: Record<string, unknown> | null = null;

    for (const key of Object.keys(authoredProperties)) {
      const track = tracks[key];
      let value = track ? evaluateTrack(track, time) : authoredProperties[key];

      const binding = reactors[key];

      if (binding) {
        const output = frameData.reactors[binding.id];

        if (output !== undefined) {
          value = binding.min + (binding.max - binding.min) * output;
        }
      }

      if (key === 'opacity' && envelope < 1 && typeof value === 'number') {
        value *= envelope;
      }

      if (value !== properties[key]) {
        next ??= {};
        next[key] = value;
      }
    }

    if (next) {
      const changes = next;
      evaluating += 1;
      try {
        this.update(changes);
      } finally {
        evaluating -= 1;
      }
    }
  }

  toJSON(): Record<string, unknown> {
    const { id, name, type, enabled, displayName, authoredProperties, reactors, clip, tracks } =
      this;

    return {
      id,
      name,
      type,
      enabled,
      displayName,
      properties: structuredClone(authoredProperties),
      reactors: structuredClone(reactors),
      ...(clip ? { clip: { ...clip } } : {}),
      ...(Object.keys(tracks).length > 0 ? { tracks: cloneTracks(tracks) } : {}),
    };
  }

  render(..._args: unknown[]) {}
}
