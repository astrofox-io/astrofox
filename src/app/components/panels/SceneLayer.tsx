import { reverse } from "@/lib/utils/array";
import Layer from "@/app/components/panels/Layer";
import { Cube, DocumentLandscape, Picture, Sun } from "@/app/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React, { useMemo } from "react";

const icons: Record<string, LucideIcon> = {
  display: Cube,
  effect: Sun,
  webgl: Cube,
};

interface SceneElement {
  id: string;
  type: string;
  displayName: string;
  enabled: boolean;
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

  const renderLayer = ({ id, type, displayName, enabled }: SceneElement) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      icon={icons[type]}
      className={"rounded ml-4"}
      enabled={enabled}
      active={id === activeElementId}
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
        {displays.map((display: SceneElement) => renderLayer(display))}
      </div>
    </div>
  );
}
