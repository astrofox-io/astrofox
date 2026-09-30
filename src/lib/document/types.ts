import type { Clip, ClipPatch } from '@/lib/timeline/clip';
import type { TimelineFps, TimelineSettings } from '@/lib/timeline/settings';
import type { ReactorConfig } from '@/lib/types';

export const DEFAULT_PROJECT_NAME = 'Untitled Project';

/** A scene, display or effect as published by the Document. Never mutated after publishing. */
export interface LayerJSON {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  displayName: string;
  properties: Record<string, unknown>;
  reactors: Record<string, ReactorConfig>;
  clip?: Clip;
  [key: string]: unknown;
}

export interface SceneJSON extends LayerJSON {
  displays: LayerJSON[];
  effects: LayerJSON[];
}

export interface ReactorJSON {
  id: string;
  name: string;
  type: string;
  displayName: string;
  enabled: boolean;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Canvas {
  width: number;
  height: number;
  backgroundColor: string;
}

export type MediaKind = 'image' | 'video';

/** A media display whose file could not be found when the project was opened. */
export interface MediaRef {
  displayId: string;
  kind: MediaKind;
  label: string;
  sourcePath: string;
}

/**
 * Everything that is saved, undone and redone. History entries and the input
 * to `load()` share this one shape.
 */
export interface DocumentSnapshot {
  canvas: Canvas;
  scenes: SceneJSON[];
  reactors: ReactorJSON[];
  timeline: TimelineSettings;
  name: string;
  unresolvedMediaRefs: MediaRef[];
}

/** The snapshot plus lookup indexes, as React reads it. */
export interface DocumentState extends DocumentSnapshot {
  sceneOrder: string[];
  sceneById: Record<string, SceneJSON>;
  elementById: Record<string, LayerJSON>;
  sceneElementsById: Record<string, { displays: string[]; effects: string[] }>;
  elementParentSceneId: Record<string, string>;
}

/** Scene and layer config accepted by `load()`: a published snapshot or a migrated project file. */
export interface LayerConfig extends Record<string, unknown> {
  id: string;
  name?: string;
  displayName?: string;
  properties?: Record<string, unknown>;
  plugin?: { url?: string };
}

export interface SceneConfig extends LayerConfig {
  displays?: LayerConfig[];
  effects?: LayerConfig[];
}

export interface LoadInput {
  canvas?: Partial<Canvas>;
  scenes?: SceneConfig[];
  reactors?: Record<string, unknown>[];
  timeline?: unknown;
  name?: string;
  unresolvedMediaRefs?: MediaRef[];
}

export interface LoadResult {
  /** Built-in elements that no longer exist and were dropped. */
  missing: string[];
  /** External plugins that are not installed. */
  missingPlugins: { name: string; url?: string }[];
}

/**
 * Every edit to the document. Ops that name a layer or reactor that does not
 * exist are no-ops; callers that must report an error (automation) check first.
 */
export type DocumentOp =
  /** Authored property values of a scene, display, effect or reactor. */
  | { type: 'setProperties'; id: string; properties: Record<string, unknown> }
  /** Layer panel attributes of a scene, display, effect or reactor. */
  | { type: 'setMeta'; id: string; displayName?: string; enabled?: boolean }
  | {
      type: 'bindReactor';
      id: string;
      property: string;
      reactorId: string;
      min: number;
      max: number;
    }
  /** The property returns to its authored value. */
  | { type: 'unbindReactor'; id: string; property: string }
  /** Replace all bindings; bindings to reactors that do not exist are dropped. */
  | { type: 'setBindings'; id: string; bindings: Record<string, ReactorConfig> }
  | { type: 'setClip'; id: string; patch: ClipPatch }
  | { type: 'clearClip'; id: string }
  | { type: 'addScene'; scene?: unknown; displayName?: string }
  /** Adds to the named scene, or the first scene when it is omitted. */
  | { type: 'addElement'; element: unknown; sceneId?: string }
  /** Copies a layer (a scene with all of its elements) right after the original. */
  | { type: 'duplicateLayer'; id: string }
  | { type: 'removeLayer'; id: string }
  /** Moves a layer within its collection by a number of positions. */
  | { type: 'moveLayer'; id: string; spaces: number }
  /** A Layers-panel drop of `sourceId` onto `targetId`. */
  | { type: 'reorderLayer'; sourceId: string; targetId: string }
  | { type: 'addReactor'; reactor?: unknown }
  /** Removes the reactor and every binding to it. */
  | { type: 'removeReactor'; id: string }
  | { type: 'setCanvas'; width?: number; height?: number; backgroundColor?: string }
  /** `duration: null` follows the loaded audio. Invalid values throw. */
  | { type: 'setTimeline'; duration?: number | null; fps?: TimelineFps }
  | { type: 'setName'; name: string }
  | { type: 'setUnresolvedMediaRefs'; refs: MediaRef[] };

export interface ApplyOptions {
  /**
   * False for changes that should not become an undo step or mark the project
   * modified, e.g. adopting the name chosen in a save dialog.
   */
  record?: boolean;
}

export interface ApplyResult {
  /** Whether the published document changed. */
  changed: boolean;
  /** The id of the layer or reactor the last creating op made. */
  id?: string;
}

export interface DocumentChange {
  kind: 'change' | 'load';
  /** False for loads and for changes applied with `record: false`. */
  record: boolean;
  previous: DocumentState;
  state: DocumentState;
}
