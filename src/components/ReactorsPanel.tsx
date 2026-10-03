// @ts-nocheck

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useApp, { setActiveReactorId } from '@/app/actions/app';
import { PRIMARY_COLOR } from '@/app/constants';
import { projectDocument, useDocument } from '@/app/document';
import { events, reactors } from '@/app/global';
import { Flash } from '@/app/icons';
import Layer from '@/components/Layer';
import CanvasMeter from '@/lib/canvas/CanvasMeter';

function ReactorMeter({ id }: { id: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const meter = useRef<CanvasMeter | null>(null);

  useEffect(() => {
    meter.current = new CanvasMeter(
      { width: 100, height: 3, color: PRIMARY_COLOR },
      canvas.current!,
    );

    function draw() {
      const reactor = reactors.getElementById(id);
      if (!reactor) return;
      const { output } = reactor.getResult();
      meter.current?.render(output);
    }

    events.on('render', draw);
    return () => {
      events.off('render', draw);
    };
  }, [id]);

  return (
    <div className="flex items-center h-8 px-2 rounded-b">
      <canvas ref={canvas} className="w-full" />
    </div>
  );
}

function ReactorRow({ id }: { id: string }) {
  const reactor = useDocument(
    useShallow(state => {
      const value = state.reactors.find(r => r.id === id);
      return value ? { displayName: value.displayName, enabled: value.enabled } : undefined;
    }),
  );
  const active = useApp(state => state.activeReactorId === id);

  function handleLayerClick(id) {
    setActiveReactorId(id);
  }

  function handleLayerUpdate(id, prop, value) {
    // Layer rows edit the visibility toggle and the name.
    projectDocument.apply(
      prop === 'enabled'
        ? { type: 'setMeta', id, enabled: Boolean(value) }
        : { type: 'setMeta', id, displayName: String(value) },
    );
  }

  // Bindings to it are removed and the selection is cleared by the document.
  function handleLayerDelete(id) {
    projectDocument.apply({ type: 'removeReactor', id });
  }

  if (!reactor) return null;

  return (
    <div className="flex flex-col border border-neutral-700 rounded mx-1">
      <Layer
        id={id}
        name={reactor.displayName}
        icon={Flash}
        active={active}
        enabled={reactor.enabled}
        onLayerClick={handleLayerClick}
        onLayerUpdate={handleLayerUpdate}
        onLayerDelete={handleLayerDelete}
        className="rounded-t"
      />
      <ReactorMeter id={id} />
    </div>
  );
}

export default function ReactorsPanel() {
  const reactorIds = useDocument(useShallow(state => state.reactors.map(r => r.id)));

  return (
    <div className="flex flex-col flex-1 relative overflow-auto">
      <div className="flex-1 overflow-auto flex flex-col gap-4 px-1">
        {reactorIds.map(id => (
          <ReactorRow key={id} id={id} />
        ))}
      </div>
    </div>
  );
}
