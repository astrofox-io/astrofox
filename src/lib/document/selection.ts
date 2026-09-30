import type { DocumentState } from './types';

type Indexes = Pick<
  DocumentState,
  'sceneById' | 'elementById' | 'sceneOrder' | 'sceneElementsById' | 'elementParentSceneId'
>;

export type LayerKind = 'scene' | 'display' | 'effect';

export function hasLayer(state: Indexes, id: string | null | undefined): id is string {
  return !!id && !!(state.sceneById[id] || state.elementById[id]);
}

export function layerKind(state: Indexes, id: string): LayerKind | null {
  if (state.sceneById[id]) {
    return 'scene';
  }

  const sceneId = state.elementParentSceneId[id];

  if (!sceneId) {
    return null;
  }

  return state.sceneElementsById[sceneId].effects.includes(id) ? 'effect' : 'display';
}

/**
 * Whether a Layers-panel drop of `sourceId` onto `targetId` is allowed:
 * scenes reorder among scenes; displays and effects reorder among their own
 * kind, or move to the end of a scene when dropped on its row.
 */
export function canReorder(
  kindOf: (id: string) => LayerKind | null,
  sourceId: string,
  targetId: string,
) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return false;
  }

  const source = kindOf(sourceId);
  const target = kindOf(targetId);

  if (!source || !target) {
    return false;
  }

  if (source === 'scene') {
    return target === 'scene';
  }

  return target === 'scene' || source === target;
}

/**
 * Which layer to select after the selected layer `id` disappeared between
 * `previous` and `next`: the top element left in its scene, else that scene,
 * else the top scene. Mirrors top-to-bottom order in the Layers panel.
 */
export function selectionAfterRemoval(previous: Indexes, next: Indexes, id: string): string | null {
  const sceneId = previous.sceneById[id] ? null : previous.elementParentSceneId[id];

  if (sceneId && next.sceneById[sceneId]) {
    const { displays, effects } = next.sceneElementsById[sceneId];
    return displays.at(-1) ?? effects.at(-1) ?? sceneId;
  }

  return next.sceneOrder.at(-1) ?? null;
}
