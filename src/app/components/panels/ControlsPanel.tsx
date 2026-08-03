import React, { useEffect, useMemo, useRef } from 'react';
import useApp, { setActiveElementId } from '@/app/actions/app';
import useScenes from '@/app/actions/scenes';
import Control from '@/app/components/controls/Control';
import { stage } from '@/app/global';
import { reverse } from '@/lib/utils/array';

interface SceneElements {
  displays: string[];
  effects: string[];
}

interface ControlItem {
  id: string;
  descriptor: Record<string, unknown>;
}

const ControlCard = React.memo(
  function ControlCard({ item, active }: { item: ControlItem; active: boolean }) {
    const display = stage.getStageElementById(item.id);

    if (!display) {
      return null;
    }

    return (
      <div
        id={`control-${item.id}`}
        className={'bg-neutral-800 rounded mb-1.5 [&:last-child]:mb-0'}
      >
        <Control
          display={display as unknown as Parameters<typeof Control>[0]['display']}
          active={active}
          onNameClick={setActiveElementId}
        />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.descriptor === nextProps.item.descriptor &&
    prevProps.active === nextProps.active,
);

export default function ControlsPanel() {
  const activeElementId = useApp(state => state.activeElementId);
  const sceneOrder = useScenes(state => state.sceneOrder);
  const sceneById = useScenes(state => state.sceneById) as Record<string, Record<string, unknown>>;
  const sceneElementsById = useScenes(state => state.sceneElementsById) as Record<
    string,
    SceneElements
  >;
  const elementById = useScenes(state => state.elementById) as Record<
    string,
    Record<string, unknown>
  >;
  const panelRef = useRef<HTMLDivElement>(null);

  const controlItems = useMemo(() => {
    const items: ControlItem[] = [];

    for (const sceneId of reverse(sceneOrder)) {
      const sceneDescriptor = sceneById[sceneId as string];
      if (sceneDescriptor) {
        items.push({
          id: sceneId as string,
          descriptor: sceneDescriptor,
        });
      }

      const sceneElements = sceneElementsById[sceneId as string];
      if (!sceneElements) {
        continue;
      }

      for (const effectId of reverse(sceneElements.effects)) {
        const descriptor = elementById[effectId];
        if (descriptor) {
          items.push({ id: effectId, descriptor });
        }
      }

      for (const displayId of reverse(sceneElements.displays)) {
        const descriptor = elementById[displayId];
        if (descriptor) {
          items.push({ id: displayId, descriptor });
        }
      }
    }

    return items;
  }, [elementById, sceneById, sceneElementsById, sceneOrder]);

  useEffect(() => {
    const node = document.getElementById(`control-${activeElementId}`);
    if (node && panelRef.current) {
      panelRef.current.scrollTop = node.offsetTop;
    }
  }, [activeElementId]);

  return (
    <div className={'flex-1 overflow-auto relative pt-1 pb-0 px-1 mb-1.5'} ref={panelRef}>
      {controlItems.map(item => (
        <ControlCard key={item.id} item={item} active={item.id === activeElementId} />
      ))}
    </div>
  );
}
