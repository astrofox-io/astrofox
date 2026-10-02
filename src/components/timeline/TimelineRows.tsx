import { clsx as classNames } from 'cnfast';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useApp, { setActiveElementId } from '@/app/actions/app';
import useTimelinePanel, { toggleSceneCollapsed } from '@/app/actions/timelinePanel';
import { projectDocument, useDocument } from '@/app/document';
import { Cube, Picture, Square, Sun } from '@/app/icons';
import { translateGeneratedName, translateLabel } from '@/i18n/labels';
import type { Clip } from '@/lib/timeline/clip';
import type { Tracks } from '@/lib/timeline/tracks';
import transportStore from '@/lib/timeline/transport';
import { reverse } from '@/lib/utils/array';
import { hasDisplayCamera } from '@/lib/utils/displayCamera';
import ClipBar from './ClipBar';
import { KEY_ROW_HEIGHT, LABEL_WIDTH, ROW_HEIGHT } from './constants';
import KeyframeLane from './KeyframeLane';

interface SceneElement {
  id: string;
  name?: string;
  type: string;
  displayName: string;
  enabled: boolean;
  clip?: Clip | null;
  tracks?: Tracks;
}

interface SceneData extends SceneElement {
  displays: SceneElement[];
  effects: SceneElement[];
}

interface Row {
  element: SceneElement;
  kind: 'scene' | 'display' | 'effect';
  sceneId: string;
  icon: LucideIcon;
  depth: number;
}

interface TimelineRowsProps {
  pixelsPerSecond: number;
  trackWidth: number;
  duration: number;
  fps: number;
  snap: boolean;
}

/** The control label of an animated property, as the controls panel shows it. */
function propertyLabel(id: string, property: string) {
  const config = (
    projectDocument.findLayer(id)?.constructor as
      | { config?: { controls?: Record<string, { label?: unknown }> } }
      | undefined
  )?.config;
  const label = config?.controls?.[property]?.label;
  return typeof label === 'string' ? label : property;
}

function iconFor(kind: Row['kind'], element: SceneElement): LucideIcon {
  if (kind === 'scene') return Picture;
  if (kind === 'effect') return Sun;
  return hasDisplayCamera(element) ? Cube : Square;
}

/** One row per scene, effect and display, in the same order as the Layers panel. */
export default function TimelineRows({
  pixelsPerSecond,
  trackWidth,
  duration,
  fps,
  snap,
}: TimelineRowsProps) {
  const { t } = useTranslation();
  const scenes = useDocument(state => state.scenes) as SceneData[];
  const activeElementId = useApp(state => state.activeElementId);
  const collapsed = useTimelinePanel(state => state.collapsed);
  const selectedKeys = useTimelinePanel(state => state.selectedKeys);

  const rows = useMemo(() => {
    const result: Row[] = [];

    for (const scene of reverse(scenes)) {
      result.push({ element: scene, kind: 'scene', sceneId: scene.id, icon: Picture, depth: 0 });

      if (collapsed[scene.id]) continue;

      for (const effect of reverse(scene.effects)) {
        result.push({
          element: effect,
          kind: 'effect',
          sceneId: scene.id,
          icon: iconFor('effect', effect),
          depth: 1,
        });
      }

      for (const display of reverse(scene.displays)) {
        result.push({
          element: display,
          kind: 'display',
          sceneId: scene.id,
          icon: iconFor('display', display),
          depth: 1,
        });
      }
    }

    return result;
  }, [scenes, collapsed]);

  // Edges of every bar; the playhead is added at drag time from the store.
  const edges = useMemo(() => {
    const times = new Set<number>([0, duration]);

    for (const { element } of rows) {
      if (element.clip) {
        times.add(element.clip.start);
        if (element.clip.end !== null) times.add(element.clip.end);
      }
    }

    return [...times];
  }, [rows, duration]);

  if (rows.length === 0) {
    return <div className="px-3 py-4 text-sm text-neutral-500">{t('timeline.no-elements')}</div>;
  }

  return (
    <div>
      {rows.map(({ element, kind, sceneId, icon: Icon, depth }) => {
        const active = element.id === activeElementId;
        const isScene = kind === 'scene';
        const snapTargets = [...edges, transportStore.getState().time].filter(
          time => time !== element.clip?.start && time !== element.clip?.end,
        );

        const tracks = Object.entries(element.tracks ?? {});
        const clipEdges = element.clip
          ? [element.clip.start, ...(element.clip.end === null ? [] : [element.clip.end])]
          : [];

        return (
          <React.Fragment key={element.id}>
            <div
              className={classNames('flex border-b border-neutral-800/70', {
                'bg-primary/15': active,
              })}
              style={{ height: ROW_HEIGHT }}
            >
              <div
                role="option"
                aria-selected={active}
                tabIndex={0}
                className={classNames(
                  'sticky left-0 z-40 flex shrink-0 cursor-default items-center gap-1.5 border-r border-neutral-800 bg-neutral-900 pr-2 text-xs',
                  active ? 'text-neutral-100' : 'text-neutral-300',
                )}
                style={{
                  width: LABEL_WIDTH,
                  paddingLeft: 6 + depth * 14,
                  backgroundColor: active
                    ? 'color-mix(in srgb, var(--color-primary) 40%, var(--color-neutral-900))'
                    : undefined,
                }}
                onClick={() => setActiveElementId(element.id)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveElementId(element.id);
                  }
                }}
              >
                {isScene ? (
                  <button
                    type="button"
                    aria-label={t(collapsed[sceneId] ? 'common.show' : 'common.hide')}
                    className={classNames(
                      '-ml-1 inline-flex size-4 shrink-0 items-center justify-center text-neutral-400 hover:text-neutral-100',
                      { 'opacity-50': !element.enabled },
                    )}
                    onClick={event => {
                      event.stopPropagation();
                      toggleSceneCollapsed(sceneId);
                    }}
                  >
                    {collapsed[sceneId] ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>
                ) : null}
                <Icon
                  className={classNames('size-3.5 shrink-0', { 'opacity-50': !element.enabled })}
                />
                <span className={classNames('truncate', { 'opacity-50': !element.enabled })}>
                  {translateGeneratedName(t, element.displayName)}
                </span>
              </div>
              <div className="relative shrink-0" style={{ width: trackWidth }}>
                <ClipBar
                  id={element.id}
                  type={kind}
                  clip={element.clip ?? null}
                  duration={duration}
                  fps={fps}
                  pixelsPerSecond={pixelsPerSecond}
                  snap={snap}
                  active={active}
                  enabled={element.enabled}
                  snapTargets={snapTargets}
                  onSelect={setActiveElementId}
                />
              </div>
            </div>
            {tracks.map(([property, track]) => (
              <div
                key={property}
                className="flex border-b border-neutral-800/40 bg-neutral-950/40"
                style={{ height: KEY_ROW_HEIGHT }}
              >
                <div
                  className="sticky left-0 z-40 flex shrink-0 items-center truncate border-r border-neutral-800 bg-neutral-900 pr-2 text-[11px] text-neutral-400"
                  style={{ width: LABEL_WIDTH, paddingLeft: 6 + (depth + 1) * 14 + 6 }}
                >
                  <span className="truncate">
                    {translateLabel(t, propertyLabel(element.id, property))}
                  </span>
                </div>
                <div className="relative shrink-0" style={{ width: trackWidth }}>
                  <KeyframeLane
                    id={element.id}
                    property={property}
                    keyframes={track.keyframes}
                    pixelsPerSecond={pixelsPerSecond}
                    fps={fps}
                    snap={snap}
                    snapTargets={[0, duration, ...clipEdges]}
                    selectedKeys={selectedKeys}
                  />
                </div>
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
