// @ts-nocheck
import useApp, { setActiveReactorId } from "@/app/actions/app";
import useReactors, {
  removeReactor,
  updateReactorProperty,
} from "@/app/actions/reactors";
import { PRIMARY_COLOR } from "@/app/constants";
import { events, reactors } from "@/app/global";
import { Flash } from "@/app/icons";
import CanvasMeter from "@/lib/canvas/CanvasMeter";
import React, { useEffect, useRef } from "react";
import Layer from "@/app/components/panels/Layer";

function ReactorMeter({ id }: { id: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const meter = useRef<CanvasMeter | null>(null);

  useEffect(() => {
    meter.current = new CanvasMeter(
      { width: 100, height: 5, color: PRIMARY_COLOR },
      canvas.current!,
    );

    function draw() {
      const reactor = reactors.getElementById(id);
      if (!reactor) return;
      const { output } = reactor.getResult();
      meter.current?.render(output);
    }

    events.on("render", draw);
    return () => {
      events.off("render", draw);
    };
  }, [id]);

  return (
    <div className="my-2 mx-1 px-2 py-1 border border-input rounded">
      <canvas ref={canvas} className="w-full" />
    </div>
  );
}

export default function ReactorsPanel() {
  const reactorList = useReactors((state) => state.reactors);
  const activeReactorId = useApp((state) => state.activeReactorId);

  function handleLayerClick(id) {
    setActiveReactorId(id);
  }

  function handleLayerUpdate(id, prop, value) {
    updateReactorProperty(id, prop, value);
  }

  function handleLayerDelete(id) {
    const reactor = reactors.getElementById(id);

    if (!reactor) return;

    if (activeReactorId === id) {
      setActiveReactorId(null);
    }

    removeReactor(reactor);
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-auto">
      <div className="flex-1 overflow-auto pt-1 flex flex-col gap-0.5">
        {reactorList.map((reactor) => (
          <div key={reactor.id} className="flex flex-col mx-1">
            <Layer
              id={reactor.id}
              name={reactor.displayName}
              icon={Flash}
              active={reactor.id === activeReactorId}
              enabled={reactor.enabled}
              onLayerClick={handleLayerClick}
              onLayerUpdate={handleLayerUpdate}
              onLayerDelete={handleLayerDelete}
            />
            <ReactorMeter id={reactor.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
