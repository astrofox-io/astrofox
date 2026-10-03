import { projectDocument } from '@/app/document';
import { endHistoryGesture } from '@/app/history';
import type { DocumentOp, LayerJSON } from '@/lib/document/types';
import { snapToFrame } from '@/lib/timeline/clip';
import {
  type AnimatableConfig,
  type Easing,
  evaluateTrack,
  type Keyframe,
  keyIndexAt,
  moveKeys,
  pasteKeys,
  removeKeys,
  setEasing,
  setKey,
  type TrackType,
  trackTypeFor,
} from '@/lib/timeline/tracks';
import { getProjectDuration, getProjectFps, getTransportTime } from '@/lib/timeline/transport';
import appStore from './app';
import timelinePanelStore from './timelinePanel';

/**
 * Keyframe editing from the controls panel and the timeline. Keys set from
 * the controls panel go at the playhead, snapped to the frame grid, so they
 * land on frames the export renders.
 */

/** One key on the timeline, as the panel selects it. */
export interface KeyRef {
  id: string;
  property: string;
  time: number;
}

function layer(id: string): LayerJSON | undefined {
  const state = projectDocument.getState();
  return state.elementById[id] ?? state.sceneById[id];
}

function keyframesOf(id: string, property: string): Keyframe[] {
  return layer(id)?.tracks?.[property]?.keyframes ?? [];
}

/** The playhead on the frame grid: where keys from the controls panel go. */
export function keyTime() {
  return snapToFrame(getTransportTime(), getProjectFps());
}

/**
 * The ◇ button: start animating a static property with a key holding its
 * value, add a key at the playhead, or remove the key there. Removing the last
 * key leaves the property static at that key's value.
 */
export function toggleKeyAtPlayhead(id: string, property: string) {
  const json = layer(id);
  if (!json) return;

  endHistoryGesture();
  const time = keyTime();
  const track = json.tracks?.[property];

  if (!track) {
    projectDocument.apply({
      type: 'setTrack',
      id,
      property,
      keyframes: [{ time, value: json.properties[property] as number | string, easing: 'linear' }],
    });
    return;
  }

  const index = keyIndexAt(track, time);

  if (index < 0) {
    projectDocument.apply({
      type: 'setTrack',
      id,
      property,
      keyframes: setKey(track.keyframes, { time, value: evaluateTrack(track, time) }),
    });
    return;
  }

  const remaining = removeKeys(track.keyframes, [track.keyframes[index].time]);
  const ops: DocumentOp[] = [{ type: 'setTrack', id, property, keyframes: remaining }];

  if (remaining.length === 0) {
    ops.push({
      type: 'setProperties',
      id,
      properties: { [property]: track.keyframes[index].value },
    });
  }

  projectDocument.apply(ops);
}

/** Editing an animated property in the controls panel sets the key at the playhead. */
export function setAnimatedValue(id: string, property: string, value: number | string) {
  projectDocument.apply({
    type: 'setTrack',
    id,
    property,
    keyframes: setKey(keyframesOf(id, property), { time: keyTime(), value }),
  });
}

// ---- Timeline selection -------------------------------------------------------

function sameKey(a: KeyRef, b: KeyRef) {
  return a.id === b.id && a.property === b.property && Math.abs(a.time - b.time) < 1e-6;
}

export function isKeySelected(selected: readonly KeyRef[], key: KeyRef) {
  return selected.some(item => sameKey(item, key));
}

/** Select a key; with `add`, toggle it in the current selection instead. */
export function selectKey(key: KeyRef, add = false) {
  const { selectedKeys } = timelinePanelStore.getState();

  if (!add) {
    timelinePanelStore.setState({ selectedKeys: [key] });
    return;
  }

  timelinePanelStore.setState({
    selectedKeys: isKeySelected(selectedKeys, key)
      ? selectedKeys.filter(item => !sameKey(item, key))
      : [...selectedKeys, key],
  });
}

export function clearKeySelection() {
  if (timelinePanelStore.getState().selectedKeys.length > 0) {
    timelinePanelStore.setState({ selectedKeys: [] });
  }
}

/** The selected keys grouped by element and property. */
function selectionGroups(keys: readonly KeyRef[]) {
  const groups = new Map<string, { id: string; property: string; times: number[] }>();

  for (const key of keys) {
    const name = `${key.id}\u0000${key.property}`;
    const group = groups.get(name) ?? { id: key.id, property: key.property, times: [] };
    group.times.push(key.time);
    groups.set(name, group);
  }

  return [...groups.values()];
}

/**
 * Remove the selected keys, as one undo step. A property that loses its last
 * key stays static at the value its last key held.
 */
export function deleteSelectedKeys() {
  const { selectedKeys } = timelinePanelStore.getState();
  if (selectedKeys.length === 0) return false;

  endHistoryGesture();
  const ops: DocumentOp[] = [];

  for (const { id, property, times } of selectionGroups(selectedKeys)) {
    const keyframes = keyframesOf(id, property);
    const remaining = removeKeys(keyframes, times);
    ops.push({ type: 'setTrack', id, property, keyframes: remaining });

    if (remaining.length === 0 && keyframes.length > 0) {
      ops.push({ type: 'setProperties', id, properties: { [property]: keyframes.at(-1)?.value } });
    }
  }

  projectDocument.apply(ops);
  timelinePanelStore.setState({ selectedKeys: [] });

  return true;
}

/** Set the easing of the selected keys (toward each one's next key). */
export function setSelectedKeysEasing(easing: Easing) {
  const { selectedKeys } = timelinePanelStore.getState();
  if (selectedKeys.length === 0) return;

  endHistoryGesture();
  projectDocument.apply(
    selectionGroups(selectedKeys).map(
      ({ id, property, times }): DocumentOp => ({
        type: 'setTrack',
        id,
        property,
        keyframes: setEasing(keyframesOf(id, property), times, easing),
      }),
    ),
  );
}

/**
 * Shift keys (the selection, during a drag) by `delta` seconds from where they
 * were when the drag began. `origin` holds each track's keys at that moment,
 * so every pointer move re-applies from the same start and the drag is one
 * undo gesture. Returns where the keys ended up, to keep them selected.
 */
export function moveKeysFrom(
  origin: ReadonlyMap<string, { id: string; property: string; keyframes: Keyframe[] }>,
  keys: readonly KeyRef[],
  delta: number,
): KeyRef[] {
  const duration = getProjectDuration();
  const groups = selectionGroups(keys);
  // One shift for every track, limited so no selected key leaves the project.
  const times = keys.map(key => key.time);
  const shift = Math.max(-Math.min(...times), Math.min(duration - Math.max(...times), delta));
  const ops: DocumentOp[] = [];

  for (const group of groups) {
    const start = origin.get(`${group.id}\u0000${group.property}`);
    if (!start) continue;

    ops.push({
      type: 'setTrack',
      id: group.id,
      property: group.property,
      keyframes: moveKeys(start.keyframes, group.times, shift, duration),
    });
  }

  projectDocument.apply(ops);

  return keys.map(key => ({ ...key, time: key.time + shift }));
}

/** Each selected track's keys now, for moveKeysFrom. */
export function captureKeys(keys: readonly KeyRef[]) {
  const origin = new Map<string, { id: string; property: string; keyframes: Keyframe[] }>();

  for (const { id, property } of selectionGroups(keys)) {
    origin.set(`${id}\u0000${property}`, { id, property, keyframes: keyframesOf(id, property) });
  }

  return origin;
}

// ---- Copy and paste ---------------------------------------------------------

/** Copied keys of one property, with times relative to the earliest copied key. */
interface CopiedTrack {
  id: string;
  property: string;
  type: TrackType;
  keyframes: Keyframe[];
}

let copiedKeys: CopiedTrack[] = [];

function trackTypeOf(id: string, property: string): TrackType | null {
  const config = (
    projectDocument.findLayer(id)?.constructor as { config?: AnimatableConfig } | undefined
  )?.config;
  return config ? trackTypeFor(config, property) : null;
}

/** Copy the selected keys. Returns false when none are selected. */
export function copySelectedKeys() {
  const { selectedKeys } = timelinePanelStore.getState();
  if (selectedKeys.length === 0) return false;

  const start = Math.min(...selectedKeys.map(key => key.time));
  const copied: CopiedTrack[] = [];

  for (const { id, property, times } of selectionGroups(selectedKeys)) {
    const type = trackTypeOf(id, property);
    const keyframes = keyframesOf(id, property)
      .filter(key => times.some(time => Math.abs(key.time - time) < 1e-6))
      .map(key => ({ ...key, time: key.time - start }));

    if (type && keyframes.length > 0) {
      copied.push({ id, property, type, keyframes });
    }
  }

  copiedKeys = copied;

  return copied.length > 0;
}

/** Copy the selected keys, then remove them. */
export function cutSelectedKeys() {
  return copySelectedKeys() && deleteSelectedKeys();
}

/**
 * Where copied keys go: onto the selected element when the keys came from one
 * other element and it has every copied property (of the same kind), so keys
 * can be carried between layers; otherwise back onto the elements they came
 * from.
 */
function pasteTarget(copied: readonly CopiedTrack[]) {
  const activeId = appStore.getState().activeElementId;
  const sources = new Set(copied.map(track => track.id));

  if (
    activeId &&
    sources.size === 1 &&
    !sources.has(activeId) &&
    copied.every(track => trackTypeOf(activeId, track.property) === track.type)
  ) {
    return () => activeId;
  }

  return (track: CopiedTrack) => track.id;
}

/**
 * Paste copied keys at the playhead (on the frame grid), keeping their spacing,
 * as one undo step, and select them. Pasted keys replace keys at the same
 * times. Returns false when nothing was pasted.
 */
export function pasteKeysAtPlayhead() {
  const target = pasteTarget(copiedKeys);
  const at = keyTime();
  const ops: DocumentOp[] = [];
  const pasted: KeyRef[] = [];

  for (const track of copiedKeys) {
    const id = target(track);

    if (!layer(id) || trackTypeOf(id, track.property) !== track.type) {
      continue;
    }

    const keyframes = pasteKeys(keyframesOf(id, track.property), track.keyframes, at);
    ops.push({ type: 'setTrack', id, property: track.property, keyframes });

    for (const key of track.keyframes) {
      pasted.push({ id, property: track.property, time: at + key.time });
    }
  }

  if (ops.length === 0) return false;

  endHistoryGesture();
  projectDocument.apply(ops);
  timelinePanelStore.setState({
    selectedKeys: pasted.filter(key =>
      keyframesOf(key.id, key.property).some(item => Math.abs(item.time - key.time) < 1e-6),
    ),
  });

  return true;
}
