import { reverse } from "@/lib/utils/array";
import Layer from "@/app/components/panels/Layer";
import { Cube, Picture, Square, Sun } from "@/app/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React, { useMemo } from "react";

const icons: Record<string, LucideIcon> = {
  effect: Sun,
  webgl: Cube,
};

interface SceneElement {
  id: string;
  name?: string;
  type: string;
  displayName: string;
  enabled: boolean;
}

function resolveLayerIcon(layer: SceneElement): LucideIcon {
  if (layer.type === "display") {
    return layer.name === "GeometryDisplay" ? Cube : Square;
  }

  return icons[layer.type] || Cube;
}

interface SceneLayerProps {
  scene: {
    id: string;
    displayName: string;
    enabled: boolean;
    displays: SceneElement[];
    effects: SceneElement[];
  };
  activeElementId: string | null;
  dragSourceId?: string | null;
  dragOverId?: string | null;
  onLayerClick?: (id: string) => void;
  onLayerUpdate?: (id: string, prop: string, value: unknown) => void;
  onLayerDelete?: (id: string) => void;
  onLayerDragStart?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDragOver?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDrop?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDragEnd?: () => void;
}

export default function SceneLayer({
  scene,
  activeElementId,
  dragSourceId = null,
  dragOverId = null,
  onLayerClick,
  onLayerUpdate,
  onLayerDelete,
  onLayerDragStart,
  onLayerDragOver,
  onLayerDrop,
  onLayerDragEnd,
}: SceneLayerProps) {
  const { id, displayName, enabled } = scene;

  const displays = useMemo(() => reverse(scene.displays), [scene.displays]);
  const effects = useMemo(() => reverse(scene.effects), [scene.effects]);
  const lastEffectId = effects[effects.length - 1]?.id;
  const lastDisplayId = displays[displays.length - 1]?.id;

  const renderLayer = ({ id, type, name, displayName, enabled }: SceneElement) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      icon={resolveLayerIcon({ id, type, name, displayName, enabled })}
      className={"rounded ml-4"}
      enabled={enabled}
      active={id === activeElementId}
      dragging={id === dragSourceId}
      dragOver={id === dragOverId}
      onLayerClick={onLayerClick}
      onLayerUpdate={onLayerUpdate}
      onLayerDelete={onLayerDelete}
      onLayerDragStart={onLayerDragStart}
      onLayerDragOver={onLayerDragOver}
      onLayerDrop={onLayerDrop}
      onLayerDragEnd={onLayerDragEnd}
    />
  );

  return (
    <div className={"flex flex-col gap-0.5"}>
      <Layer
        key={id}
        id={id}
        name={displayName}
        icon={Picture}
        enabled={enabled}
        active={id === activeElementId}
        dragging={id === dragSourceId}
        dragOver={id === dragOverId}
        onLayerClick={onLayerClick}
        onLayerUpdate={onLayerUpdate}
        onLayerDelete={onLayerDelete}
        onLayerDragStart={onLayerDragStart}
        onLayerDragOver={onLayerDragOver}
        onLayerDrop={onLayerDrop}
        onLayerDragEnd={onLayerDragEnd}
        className="rounded"
      />
      <div className={classNames("flex flex-col gap-0.5")}>
        {effects.map((effect: SceneElement) => renderLayer(effect))}
        {lastEffectId && (
          <div
            className="h-2 ml-4"
            onDragOver={(e) => onLayerDragOver?.(lastEffectId, e)}
            onDrop={(e) => onLayerDrop?.(lastEffectId, e)}
          />
        )}
        {displays.map((display: SceneElement) => renderLayer(display))}
        {lastDisplayId && (
          <div
            className="h-2 ml-4"
            onDragOver={(e) => onLayerDragOver?.(lastDisplayId, e)}
            onDrop={(e) => onLayerDrop?.(lastDisplayId, e)}
          />
        )}
      </div>
    </div>
  );
}
