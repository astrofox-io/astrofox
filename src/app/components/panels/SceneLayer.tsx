import { clsx as classNames } from 'cnfast';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layer from '@/app/components/panels/Layer';
import SectionAddMenu from '@/app/components/panels/SectionAddMenu';
import { Cube, Picture, Square, Sun } from '@/app/icons';
import { translateGeneratedName, translateLabel } from '@/i18n/labels';
import { reverse } from '@/lib/utils/array';
import { getDisplayRenderGroup } from '@/lib/utils/displayRenderGroup';

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
  if (layer.type === 'display') {
    return getDisplayRenderGroup(layer) === '3d' ? Cube : Square;
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
  dragSourceType?: string | null;
  dragSourceRenderGroup?: string | null;
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
  dragSourceType = null,
  dragSourceRenderGroup = null,
  onLayerClick,
  onLayerUpdate,
  onLayerDelete,
  onLayerDragStart,
  onLayerDragOver,
  onLayerDrop,
  onLayerDragEnd,
}: SceneLayerProps) {
  const { t } = useTranslation();
  const { id, displayName, enabled } = scene;
  const sceneDragging = dragSourceId === id;
  const sceneDragOver = dragOverId === id;

  const displays3D = useMemo(
    () => reverse(scene.displays.filter(display => getDisplayRenderGroup(display) === '3d')),
    [scene.displays],
  );
  const displays2D = useMemo(
    () => reverse(scene.displays.filter(display => getDisplayRenderGroup(display) === '2d')),
    [scene.displays],
  );
  const effects = useMemo(() => reverse(scene.effects), [scene.effects]);

  const renderLayer = ({ id, type, name, displayName, enabled }: SceneElement) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      displayName={translateGeneratedName(t, displayName)}
      icon={resolveLayerIcon({ id, type, name, displayName, enabled })}
      className={'rounded ml-4'}
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

  const renderSection = (
    title: string,
    layers: SceneElement[],
    sectionType: 'effect' | 'display',
    addMenu: React.ReactNode,
    sectionRenderGroup: '2d' | '3d' | null = null,
  ) => (
    <div className="flex flex-col gap-0.5">
      <div className="ml-4 flex items-center pl-2 pr-1 pt-1 pb-0.5">
        <div className="text-[10px] font-semibold uppercase text-neutral-400">
          {translateLabel(t, title)}
        </div>
        <div className="ml-auto">{addMenu}</div>
      </div>
      {layers.length > 0 ? layers.map((layer: SceneElement) => renderLayer(layer)) : null}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Drop target for moving layers into this section. */}
      <div
        className="ml-4 h-1.5"
        onDragOver={e => {
          if (
            dragSourceType !== sectionType ||
            (sectionRenderGroup && dragSourceRenderGroup !== sectionRenderGroup)
          ) {
            return;
          }

          onLayerDragOver?.(scene.id, e);
        }}
        onDrop={e => {
          if (
            dragSourceType !== sectionType ||
            (sectionRenderGroup && dragSourceRenderGroup !== sectionRenderGroup)
          ) {
            return;
          }

          onLayerDrop?.(scene.id, e);
        }}
      />
    </div>
  );

  return (
    <div
      className={classNames('flex flex-col gap-0.5 rounded', {
        'opacity-25': sceneDragging,
        'ring-1 ring-primary': sceneDragOver,
      })}
      onDragOverCapture={e => {
        if (dragSourceType !== 'scene') {
          return;
        }

        onLayerDragOver?.(id, e);
      }}
      onDropCapture={e => {
        if (dragSourceType !== 'scene') {
          return;
        }

        onLayerDrop?.(id, e);
      }}
    >
      <Layer
        key={id}
        id={id}
        name={displayName}
        displayName={translateGeneratedName(t, displayName)}
        icon={Picture}
        enabled={enabled}
        active={id === activeElementId}
        dragging={sceneDragging}
        dragOver={sceneDragOver}
        onLayerClick={onLayerClick}
        onLayerUpdate={onLayerUpdate}
        onLayerDelete={onLayerDelete}
        onLayerDragStart={onLayerDragStart}
        onLayerDragOver={onLayerDragOver}
        onLayerDrop={onLayerDrop}
        onLayerDragEnd={onLayerDragEnd}
        className="rounded"
      />
      <div className={classNames('flex flex-col gap-1')}>
        {renderSection(
          'Effects',
          effects,
          'effect',
          <SectionAddMenu sceneId={id} kind="effects" />,
        )}
        {renderSection(
          '2D Displays',
          displays2D,
          'display',
          <SectionAddMenu sceneId={id} kind="2d" />,
          '2d',
        )}
        {renderSection(
          '3D Displays',
          displays3D,
          'display',
          <SectionAddMenu sceneId={id} kind="3d" />,
          '3d',
        )}
      </div>
    </div>
  );
}
