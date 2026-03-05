import { reverse } from "@/lib/utils/array";
import useApp, { setActiveElementId } from "@/app/actions/app";
import useScenes from "@/app/actions/scenes";
import Control from "@/app/components/controls/Control";
import { stage } from "@/app/global";
import React, { useMemo, useRef, useEffect } from "react";

interface SceneElements {
  displays: string[];
  effects: string[];
}

export default function ControlsPanel() {
  const activeElementId = useApp((state) => state.activeElementId);
  const sceneOrder = useScenes((state) => state.sceneOrder);
  const sceneElementsById = useScenes(
    (state) => state.sceneElementsById,
  ) as Record<string, SceneElements>;
  const panelRef = useRef<HTMLDivElement>(null);

  const displayIds = useMemo(() => {
    const ids: string[] = [];

    for (const sceneId of reverse(sceneOrder)) {
      ids.push(sceneId as string);

      const sceneElements = sceneElementsById[sceneId as string];
      if (!sceneElements) {
        continue;
      }

      ids.push(...reverse(sceneElements.effects));
      ids.push(...reverse(sceneElements.displays));
    }

    return ids;
  }, [sceneOrder, sceneElementsById]);

  const displays = useMemo(() => {
    return displayIds
      .map((id) => stage.getStageElementById(id))
      .filter((display) => !!display);
  }, [displayIds]);

  useEffect(() => {
    const node = document.getElementById(`control-${activeElementId}`);
    if (node && panelRef.current) {
      panelRef.current.scrollTop = node.offsetTop;
    }
  }, [activeElementId]);

  return (
    <div
      className={"flex-1 overflow-auto relative pt-1 pb-0 px-1 mb-1.5"}
      ref={panelRef}
    >
      {displays.map((display) => {
        const { id } = display as { id: string };

        return (
          <div
            id={`control-${id}`}
            key={id as string}
            className={"bg-neutral-800 rounded mb-1.5 [&:last-child]:mb-0"}
          >
            <Control
              display={
                display as unknown as Parameters<typeof Control>[0]["display"]
              }
              onNameClick={setActiveElementId}
            />
          </div>
        );
      })}
    </div>
  );
}
