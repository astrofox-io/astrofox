import { reverse } from "@/lib/utils/array";
import useApp, { setActiveElementId } from "@/app/actions/app";
import useScenes, {
  moveElement,
  reorderElement,
  removeElement,
  updateElement,
} from "@/app/actions/scenes";
import SceneLayer from "@/app/components/panels/SceneLayer";
import { ChevronDown, ChevronUp } from "@/app/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import classNames from "classnames";
import React, { useEffect, useMemo, useState } from "react";

interface SceneElement {
  id: string;
  type: string;
  displayName: string;
  enabled: boolean;
}

interface SceneData {
  id: string;
  displayName: string;
  enabled: boolean;
  displays: SceneElement[];
  effects: SceneElement[];
}

export default function LayersPanel() {
  const scenes = useScenes((state) => state.scenes) as SceneData[];
  const activeElementId = useApp((state) => state.activeElementId);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const hasScenes = scenes.length > 0;
  const layerSelected = hasScenes && activeElementId;

  const sortedScenes = useMemo(() => reverse(scenes), [scenes]);
  const lastSceneId = sortedScenes[sortedScenes.length - 1]?.id;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.classList.toggle("layers-dragging", Boolean(dragSourceId));

    return () => {
      document.body.classList.remove("layers-dragging");
    };
  }, [dragSourceId]);

  const activeScene = useMemo(() => {
    return scenes.reduce((memo: SceneData | undefined, scene: SceneData) => {
      if (!memo) {
        if (
          scene?.id === activeElementId ||
          scene?.displays.find(
            (e: { id: string }) => e.id === activeElementId,
          ) ||
          scene?.effects.find((e: { id: string }) => e.id === activeElementId)
        ) {
          memo = scene;
        }
      }
      return memo;
    }, undefined);
  }, [scenes, activeElementId]);

  const { canMoveUp, canMoveDown } = useMemo(() => {
    if (!layerSelected) return { canMoveUp: false, canMoveDown: false };

    // Check if it's a scene
    const sceneIndex = scenes.findIndex((s) => s.id === activeElementId);
    if (sceneIndex > -1) {
      return {
        canMoveUp: sceneIndex < scenes.length - 1,
        canMoveDown: sceneIndex > 0,
      };
    }

    // Check displays and effects within the owning scene
    for (const scene of scenes) {
      const displayIndex = scene.displays.findIndex(
        (d: { id: string }) => d.id === activeElementId,
      );
      if (displayIndex > -1) {
        return {
          canMoveUp: displayIndex < scene.displays.length - 1,
          canMoveDown: displayIndex > 0,
        };
      }

      const effectIndex = scene.effects.findIndex(
        (e: { id: string }) => e.id === activeElementId,
      );
      if (effectIndex > -1) {
        return {
          canMoveUp: effectIndex < scene.effects.length - 1,
          canMoveDown: effectIndex > 0,
        };
      }
    }

    return { canMoveUp: false, canMoveDown: false };
  }, [scenes, activeElementId, layerSelected]);

  function handleLayerClick(id: string) {
    setActiveElementId(id);
  }

  function handleLayerUpdate(id: string, prop: string, value: unknown) {
    updateElement(id, prop, value);
  }

  function getLayerMeta(id: string) {
    const sceneIndex = scenes.findIndex((scene) => scene.id === id);
    if (sceneIndex > -1) {
      return { type: "scene", sceneId: id };
    }

    for (const scene of scenes) {
      if (scene.displays.some((display) => display.id === id)) {
        return { type: "display", sceneId: scene.id };
      }

      if (scene.effects.some((effect) => effect.id === id)) {
        return { type: "effect", sceneId: scene.id };
      }
    }

    return null;
  }

  function canDrop(sourceId: string, targetId: string) {
    if (!sourceId || !targetId || sourceId === targetId) {
      return false;
    }

    const sourceMeta = getLayerMeta(sourceId);
    const targetMeta = getLayerMeta(targetId);

    if (!sourceMeta || !targetMeta) {
      return false;
    }

    if (sourceMeta.type === "scene") {
      return targetMeta.type === "scene";
    }

    if (targetMeta.type === "scene") {
      return true;
    }

    return sourceMeta.type === targetMeta.type;
  }

  function handleMoveUp() {
    moveElement(activeElementId, 1);
  }
  function handleMoveDown() {
    moveElement(activeElementId, -1);
  }

  function handleRemove(id: string) {
    if (!id) return;

    const ownerScene = scenes.reduce(
      (memo: SceneData | undefined, scene: SceneData) => {
        if (!memo) {
          if (
            scene?.id === id ||
            scene?.displays.find((e: { id: string }) => e.id === id) ||
            scene?.effects.find((e: { id: string }) => e.id === id)
          ) {
            memo = scene;
          }
        }
        return memo;
      },
      undefined,
    );

    if (id === ownerScene?.id) {
      const newScene = sortedScenes.find((e) => e !== ownerScene);
      setActiveElementId(newScene?.id);
    } else if (id === activeElementId) {
      if (ownerScene) {
        const { displays, effects } = ownerScene;
        const element =
          reverse(displays).find(
            (e: { id: string }) => (e as { id: string }).id !== id,
          ) ||
          reverse(effects).find(
            (e: { id: string }) => (e as { id: string }).id !== id,
          );

        if (element) {
          setActiveElementId((element as { id: string })?.id);
        } else {
          setActiveElementId(ownerScene?.id);
        }
      }
    }

    removeElement(id);
  }

  function handleLayerDragStart(id: string) {
    setDragSourceId(id);
    setDragOverId(null);
  }

  function handleLayerDragOver(id: string, e: React.DragEvent<HTMLDivElement>) {
    const sourceId = dragSourceId;
    if (!sourceId) {
      return;
    }

    if (!canDrop(sourceId, id)) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (dragOverId !== id) {
      setDragOverId(id);
    }
  }

  function resetDragState() {
    setDragSourceId(null);
    setDragOverId(null);
  }

  function handleLayerDrop(id: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const sourceId = dragSourceId;
    if (!sourceId) {
      resetDragState();
      return;
    }

    if (canDrop(sourceId, id)) {
      const moved = reorderElement(sourceId, id);
      if (moved) {
        setActiveElementId(sourceId);
      }
    }

    resetDragState();
  }

  return (
    <div
      className={"flex flex-col flex-1 relative overflow-auto"}
      onDragOver={(e) => {
        if (!dragSourceId) {
          return;
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
    >
      <div className={"flex p-1 gap-1"}>
        <div
          className={classNames(
            "text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0",
            { "opacity-30 hover:bg-neutral-900": !canMoveUp },
          )}
          onClick={canMoveUp ? handleMoveUp : undefined}
        >
          <ChevronUp className="text-neutral-100 w-4 h-4" />
        </div>
        <div
          className={classNames(
            "text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0",
            { "opacity-30 hover:bg-neutral-900": !canMoveDown },
          )}
          onClick={canMoveDown ? handleMoveDown : undefined}
        >
          <ChevronDown className="text-neutral-100 w-4 h-4" />
        </div>
      </div>
      <div className={"flex-1 overflow-auto pt-1 flex flex-col gap-0.5 px-1"}>
        {sortedScenes.map((scene) => (
          <SceneLayer
            key={scene.id}
            scene={scene}
            activeElementId={activeElementId}
            dragSourceId={dragSourceId}
            dragOverId={dragOverId}
            onLayerClick={handleLayerClick}
            onLayerUpdate={handleLayerUpdate}
            onLayerDelete={handleRemove}
            onLayerDragStart={handleLayerDragStart}
            onLayerDragOver={handleLayerDragOver}
            onLayerDrop={handleLayerDrop}
            onLayerDragEnd={resetDragState}
          />
        ))}
        {lastSceneId && (
          <div
            className="h-2"
            onDragOver={(e) => handleLayerDragOver(lastSceneId, e)}
            onDrop={(e) => handleLayerDrop(lastSceneId, e)}
          />
        )}
      </div>
    </div>
  );
}
