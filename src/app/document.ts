import { useStore } from 'zustand';
import { library, reactors, renderBackend, renderer, stage } from '@/app/global';
import type Entity from '@/lib/core/Entity';
import { createDocument, type ProjectDocument } from '@/lib/document/document';
import type { DocumentState } from '@/lib/document/types';
import { applyTimelineSettings, getProjectDuration } from '@/lib/timeline/transport';

type LayerConstructor = new (properties?: Record<string, unknown>) => Entity;

function libraryType(kind: 'displays' | 'effects', name: string) {
  return (library.get(kind) as Record<string, LayerConstructor> | undefined)?.[name];
}

let instance: ProjectDocument | undefined;

// Created on first use, not at import: `@/app/global` imports the renderer,
// whose display layers import this module, so `stage` is not initialized yet
// while this module is first evaluated.
function get() {
  instance ??= createDocument({
    stage,
    reactors,
    resolveType: name => libraryType('displays', name) ?? libraryType('effects', name),
    applyCanvas: canvas => renderBackend.update(canvas),
    applyTimeline: settings => applyTimelineSettings(settings),
    requestRender: () => renderer.requestRender(),
    getProjectDuration,
  });

  return instance;
}

/**
 * The open project's content. Every edit, from the UI, MCP automation or
 * undo, goes through `projectDocument.apply()`; React reads `useDocument()`.
 */
export const projectDocument: ProjectDocument = {
  get store() {
    return get().store;
  },
  getState: () => get().getState(),
  snapshot: () => get().snapshot(),
  apply: (ops, options) => get().apply(ops, options),
  load: input => get().load(input),
  findLayer: id => get().findLayer(id),
  findReactor: id => get().findReactor(id),
  subscribe: listener => get().subscribe(listener),
};

export function useDocument<T>(selector: (state: DocumentState) => T): T {
  return useStore(projectDocument.store, selector);
}
