import { create } from 'zustand';
import { projectDocument } from '@/app/document';
import { endHistoryGesture } from '@/app/history';
import type { DocumentOp, LayerJSON } from '@/lib/document/types';
import appStore, { setActiveElementId } from './app';

/** Copied layer properties, bindings and keyframes, pasted onto a layer of the same type. */
type PropertyClipboard = Pick<LayerJSON, 'name' | 'type' | 'properties' | 'reactors' | 'tracks'>;

const clipboardStore = create(() => ({ clipboard: null as PropertyClipboard | null }));

export function selectedLayer(): LayerJSON | undefined {
  const id = appStore.getState().activeElementId;
  const state = projectDocument.getState();
  return id ? state.sceneById[id] || state.elementById[id] : undefined;
}

export function duplicateLayer() {
  endHistoryGesture();
  const source = selectedLayer();
  if (!source) return;
  const { id } = projectDocument.apply({ type: 'duplicateLayer', id: source.id });
  if (id) setActiveElementId(id);
}

export function copyProperties() {
  const layer = selectedLayer();
  if (layer) {
    const { name, type, properties, reactors, tracks } = layer;
    clipboardStore.setState({
      clipboard: structuredClone({ name, type, properties, reactors, tracks }),
    });
  }
}

export function canPasteProperties() {
  const layer = selectedLayer();
  const { clipboard } = clipboardStore.getState();
  return !!layer && !!clipboard && layer.name === clipboard.name && layer.type === clipboard.type;
}

export function pasteProperties() {
  if (!canPasteProperties()) return;
  endHistoryGesture();
  const layer = selectedLayer() as LayerJSON;
  const clipboard = clipboardStore.getState().clipboard as PropertyClipboard;
  projectDocument.apply([
    { type: 'setProperties', id: layer.id, properties: structuredClone(clipboard.properties) },
    { type: 'setBindings', id: layer.id, bindings: clipboard.reactors ?? {} },
    { type: 'clearTracks', id: layer.id },
    ...Object.entries(clipboard.tracks ?? {}).map(
      ([property, track]): DocumentOp => ({
        type: 'setTrack',
        id: layer.id,
        property,
        keyframes: structuredClone(track.keyframes),
      }),
    ),
  ]);
}

/** Whether properties have been copied, for menus that show Paste. */
export function useHasCopiedProperties() {
  return clipboardStore(state => state.clipboard !== null);
}
