import { clsx as classNames } from 'cnfast';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Cube, Picture, Square, Sun } from '@/app/icons';
import Layer from '@/components/Layer';
import SectionAddMenu from '@/components/SectionAddMenu';
import { translateGeneratedName, translateLabel } from '@/i18n/labels';
import { reverse } from '@/lib/utils/array';
import { hasDisplayCamera } from '@/lib/utils/displayCamera';

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
    return hasDisplayCamera(layer) ? Cube : Square;
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

  const displays = useMemo(() => reverse(scene.displays), [scene.displays]);
  const effects = useMemo(() => reverse(scene.effects), [scene.effects]);

  const renderLayer = ({ id, type, name, displayName, enabled }: SceneElement) => (
    <Layer
      key={id}
      id={id}
      name={displayName}
      displayName={translateGeneratedName(t, displayName)}
      icon={resolveLayerIcon({ id, type, name, displayName, enabled })}
      className={'rounded'}
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
  ) => (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center pr-1 pb-0.5">
        <div className="text-xs uppercase text-neutral-400">{translateLabel(t, title)}</div>
        <div className="ml-auto">{addMenu}</div>
      </div>
      {layers.length > 0 ? layers.map((layer: SceneElement) => renderLayer(layer)) : null}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Drop target for moving layers into this section. */}
      <div
        className="h-1.5"
        onDragOver={e => {
          if (dragSourceType !== sectionType) {
            return;
          }

          onLayerDragOver?.(scene.id, e);
        }}
        onDrop={e => {
          if (dragSourceType !== sectionType) {
            return;
          }

          onLayerDrop?.(scene.id, e);
        }}
      />
    </div>
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Fallback drop target so layers can be dropped anywhere on the scene.
    <div
      className={classNames('flex flex-col gap-0.5 overflow-hidden rounded', {
        'opacity-25': sceneDragging,
        'ring-1 ring-primary': sceneDragOver,
      })}
      onDragOver={e => onLayerDragOver?.(id, e)}
      onDrop={e => onLayerDrop?.(id, e)}
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
      <div className={classNames('flex flex-col gap-1 border-l-1 border-border ml-4 pl-4 pt-2')}>
        {renderSection(
          'Effects',
          effects,
          'effect',
          <SectionAddMenu sceneId={id} kind="effects" />,
        )}
        {renderSection(
          'Displays',
          displays,
          'display',
          <SectionAddMenu sceneId={id} kind="displays" />,
        )}
      </div>
    </div>
  );
}
