import { Maximize2, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApp from '@/app/actions/app';
import {
  clearKeySelection,
  deleteSelectedKeys,
  setSelectedKeysEasing,
} from '@/app/actions/keyframes';
import {
  pauseTransport,
  playTransport,
  seekTransport,
  stepTransport,
  toggleTransport,
} from '@/app/actions/timeline';
import useTimelinePanel, {
  setTimelineHeight,
  setTimelineOpen,
  setTimelineSnap,
  setTimelineZoom,
  TIMELINE_MAX_ZOOM,
} from '@/app/actions/timelinePanel';
import { projectDocument, useDocument } from '@/app/document';
import { Times } from '@/app/icons';
import NumberInput from '@/components/NumberInput';
import SelectInput from '@/components/SelectInput';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EASINGS, type Easing } from '@/lib/timeline/tracks';
import transportStore, {
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  TIMELINE_FPS_OPTIONS,
  type TimelineFps,
} from '@/lib/timeline/transport';
import { formatTimecode } from '@/lib/utils/format';
import { LABEL_WIDTH, RULER_HEIGHT, TRACK_PADDING } from './constants';
import Playhead from './Playhead';
import TimelineRows from './TimelineRows';
import TimelineRuler from './TimelineRuler';
import { getTimelineScale, scrollLeftForAnchor, timeAtViewportX, wheelZoomFactor } from './zoom';

const ZOOM_STEP = 1.5;

/** A project time pinned to a point in the scroll viewport while zooming. */
interface ZoomAnchor {
  time: number;
  /** Distance from the scroll container's left edge, in px. */
  viewportX: number;
}

function TimeReadout({ fps }: { fps: number }) {
  const time = transportStore(state => state.time);
  const duration = transportStore(state => state.duration);

  return (
    <div className="font-mono text-xs tabular-nums text-neutral-300">
      <span className="text-neutral-100">{formatTimecode(time, fps)}</span>
      <span className="mx-1.5 text-neutral-600">/</span>
      <span>{formatTimecode(duration, fps)}</span>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 text-neutral-400 hover:text-neutral-100"
              aria-label={label}
              onClick={onClick}
            />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** The playhead if it is on screen, otherwise the centre of the track area. */
function defaultZoomAnchor(
  element: HTMLElement,
  pixelsPerSecond: number,
  duration: number,
): ZoomAnchor {
  const time = transportStore.getState().time;
  const playheadX = LABEL_WIDTH + time * pixelsPerSecond - element.scrollLeft;
  if (playheadX >= LABEL_WIDTH && playheadX <= element.clientWidth) {
    return { time, viewportX: playheadX };
  }

  const viewportX = LABEL_WIDTH + (element.clientWidth - LABEL_WIDTH) / 2;
  return {
    time: timeAtViewportX(viewportX, element.scrollLeft, pixelsPerSecond, duration),
    viewportX,
  };
}

/**
 * Bottom timeline: a ruler with the waveform, one bar per element, and the
 * playhead. Height is draggable from its top edge; zoom and snapping live in
 * the header. Keyboard: Space play/pause, ←/→ step a frame (Shift: a second),
 * Home/End, Delete removes the selected keyframes (or, with none selected,
 * resets the selected element's clip), Escape deselects keys, =/- zoom, \ fits.
 * Ctrl/Cmd/Alt + wheel (or a trackpad pinch) zooms around the cursor; the
 * zoom buttons and keys zoom around the playhead, or the view's centre when
 * the playhead is off-screen.
 */
/** The easing of the selected keys, shown while any are selected. */
function KeyEasing({ count }: { count: number }) {
  const { t } = useTranslation(undefined, { keyPrefix: 'timeline' });
  const selectedKeys = useTimelinePanel(state => state.selectedKeys);
  // The easing they share, or none when they differ.
  const easing = useDocument(state => {
    const easings = new Set<string>();
    for (const { id, property, time } of selectedKeys) {
      const layer = state.elementById[id] ?? state.sceneById[id];
      const key = layer?.tracks?.[property]?.keyframes.find(
        item => Math.abs(item.time - time) < 1e-6,
      );
      if (key) easings.add(key.easing);
    }
    return easings.size === 1 ? [...easings][0] : '';
  });

  return (
    <div className="flex items-center gap-1.5">
      <span>
        {count > 1 ? `${t('keyframe')} ×${count}` : t('keyframe')} · {t('easing')}
      </span>
      <SelectInput
        name="easing"
        value={easing}
        width={120}
        items={EASINGS.map(item => ({ label: t(`easing-${item}`), value: item }))}
        onChange={(_name, value) => setSelectedKeysEasing(value as Easing)}
      />
      <IconButton label={t('delete-keyframes')} onClick={() => deleteSelectedKeys()}>
        <Trash2 className="size-3.5" />
      </IconButton>
    </div>
  );
}

export default function TimelinePanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'timeline' });
  const height = useTimelinePanel(state => state.height);
  const zoom = useTimelinePanel(state => state.zoom);
  const snap = useTimelinePanel(state => state.snap);
  const selectedKeys = useTimelinePanel(state => state.selectedKeys);
  const duration = transportStore(state => state.duration);
  const explicitDuration = transportStore(state => state.explicitDuration);
  const fps = transportStore(state => state.fps);
  const activeElementId = useApp(state => state.activeElementId);
  const isVideoRecording = useApp(state => state.isVideoRecording);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const resize = useRef<{ startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      setViewportWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const { pixelsPerSecond, maxZoom } = getTimelineScale(
    viewportWidth,
    duration,
    zoom,
    TIMELINE_MAX_ZOOM,
  );
  const trackWidth = Math.ceil(duration * pixelsPerSecond) + TRACK_PADDING;

  // The rendered scale, for handlers that run outside React (wheel) or before
  // the next render (several wheel events in one frame).
  const view = useRef({ pixelsPerSecond, maxZoom, duration });
  view.current = { pixelsPerSecond, maxZoom, duration };
  const pendingAnchor = useRef<ZoomAnchor | null>(null);

  // Once the new scale is laid out, scroll so the anchor stays put.
  useLayoutEffect(() => {
    const anchor = pendingAnchor.current;
    const element = scrollRef.current;
    pendingAnchor.current = null;
    if (!anchor || !element) return;
    element.scrollLeft = scrollLeftForAnchor(anchor.time, anchor.viewportX, pixelsPerSecond);
  }, [pixelsPerSecond]);

  /** Multiply the zoom by `factor`, keeping `anchor` (default: playhead or centre) in place. */
  const zoomBy = useCallback((factor: number, anchor?: ZoomAnchor) => {
    const element = scrollRef.current;
    const { pixelsPerSecond, maxZoom, duration } = view.current;
    const current = Math.max(1, Math.min(maxZoom, useTimelinePanel.getState().zoom));
    const next = Math.max(1, Math.min(maxZoom, current * factor));
    if (!element || next === current) return;

    pendingAnchor.current = anchor ?? defaultZoomAnchor(element, pixelsPerSecond, duration);
    setTimelineZoom(next);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Native listener: React's wheel listeners are passive and cannot stop the
    // browser from scrolling (or page-zooming on Ctrl + wheel / pinch).
    function handleWheel(event: WheelEvent) {
      if (!(event.ctrlKey || event.metaKey || event.altKey) || !element) return;
      event.preventDefault();

      const { pixelsPerSecond, duration } = view.current;
      const viewportX = Math.max(LABEL_WIDTH, event.clientX - element.getBoundingClientRect().left);
      zoomBy(wheelZoomFactor(event.deltaY, event.deltaMode), {
        time: timeAtViewportX(viewportX, element.scrollLeft, pixelsPerSecond, duration),
        viewportX,
      });
    }

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [zoomBy]);

  function fitProject() {
    pendingAnchor.current = null;
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    setTimelineZoom(1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))
    ) {
      return;
    }

    if (isVideoRecording) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        toggleTransport();
        break;
      case 'ArrowLeft':
      case 'ArrowRight': {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        if (event.shiftKey) seekTransport(transportStore.getState().time + direction);
        else stepTransport(direction);
        break;
      }
      case 'Home':
        event.preventDefault();
        seekTransport(0);
        break;
      case 'End':
        event.preventDefault();
        seekTransport(duration);
        break;
      case 'Escape':
        clearKeySelection();
        break;
      case 'Delete':
      case 'Backspace':
        if (deleteSelectedKeys()) {
          event.preventDefault();
        } else if (activeElementId) {
          event.preventDefault();
          projectDocument.apply({ type: 'clearClip', id: activeElementId });
        }
        break;
      case 'k':
        pauseTransport();
        break;
      case '=':
      case '+':
      case '-':
      case '\\':
        // Leave Ctrl/Cmd combinations to the app (e.g. window zoom).
        if (event.ctrlKey || event.metaKey || event.altKey) break;
        event.preventDefault();
        if (event.key === '\\') fitProject();
        else zoomBy(event.key === '-' ? 1 / ZOOM_STEP : ZOOM_STEP);
        break;
      case 'l':
        playTransport();
        break;
    }
  }

  function handleResizeStart(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    resize.current = { startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = resize.current;
    if (!state) return;
    setTimelineHeight(state.startHeight - (event.clientY - state.startY));
  }

  function handleResizeEnd(event: React.PointerEvent<HTMLDivElement>) {
    resize.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Keyboard shortcuts for the whole panel; rows and controls inside are focusable.
    <div
      className="relative flex shrink-0 flex-col border-t border-neutral-800 bg-neutral-900 outline-none"
      style={{ height }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-x-0 -top-px z-40 h-1.5 cursor-row-resize hover:bg-primary/60"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      />
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-3 py-2">
        <div className="text-xs uppercase text-neutral-400">{t('title')}</div>
        <TimeReadout fps={fps} />
        <div className="ml-auto flex items-center gap-3 text-xs text-neutral-400">
          {selectedKeys.length > 0 ? <KeyEasing count={selectedKeys.length} /> : null}
          <div className="flex items-center gap-1.5">
            <span>{t('duration')}</span>
            <NumberInput
              name="duration"
              value={Math.round(duration * 100) / 100}
              width={64}
              min={MIN_PROJECT_DURATION}
              max={MAX_PROJECT_DURATION}
              step={0.01}
              disabled={isVideoRecording}
              onChange={(_name, value) => {
                // Buffered inputs also submit on blur; only an edit should disable auto duration.
                if (value !== Math.round(duration * 100) / 100)
                  projectDocument.apply({ type: 'setTimeline', duration: value });
              }}
            />
            {explicitDuration ? (
              <button
                type="button"
                className="text-neutral-400 underline-offset-2 hover:text-neutral-100 hover:underline"
                title={t('follow-audio-help')}
                onClick={() => projectDocument.apply({ type: 'setTimeline', duration: null })}
              >
                {t('follow-audio')}
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t('fps')}</span>
            <SelectInput
              name="fps"
              value={fps}
              width={64}
              items={[...TIMELINE_FPS_OPTIONS]}
              onChange={(_name, value) =>
                projectDocument.apply({ type: 'setTimeline', fps: Number(value) as TimelineFps })
              }
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t('snap')}</span>
            <Switch
              size="sm"
              checked={snap}
              onCheckedChange={checked => setTimelineSnap(!!checked)}
            />
          </div>
          <div className="flex items-center gap-0.5">
            <IconButton label={t('zoom-out')} onClick={() => zoomBy(1 / ZOOM_STEP)}>
              <ZoomOut className="size-3.5" />
            </IconButton>
            <IconButton label={t('zoom-in')} onClick={() => zoomBy(ZOOM_STEP)}>
              <ZoomIn className="size-3.5" />
            </IconButton>
            <IconButton label={t('zoom-fit')} onClick={fitProject}>
              <Maximize2 className="size-3.5" />
            </IconButton>
          </div>
          <IconButton label={t('hide')} onClick={() => setTimelineOpen(false)}>
            <Times className="size-3.5" />
          </IconButton>
        </div>
      </div>
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
        <div className="relative" style={{ width: LABEL_WIDTH + trackWidth, minHeight: '100%' }}>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-35">
            <div
              className="sticky left-0 h-full border-r border-neutral-800 bg-neutral-900"
              style={{ width: LABEL_WIDTH }}
            >
              <div
                className="sticky top-0 flex items-end border-b border-neutral-800 bg-neutral-900 px-2 pb-1 text-[10px] uppercase text-neutral-500"
                style={{ height: RULER_HEIGHT }}
              >
                {t('title')}
              </div>
            </div>
          </div>
          <TimelineRuler
            pixelsPerSecond={pixelsPerSecond}
            trackWidth={trackWidth}
            duration={duration}
            fps={fps}
            snap={snap}
          />
          <TimelineRows
            pixelsPerSecond={pixelsPerSecond}
            trackWidth={trackWidth}
            duration={duration}
            fps={fps}
            snap={snap}
          />
          <Playhead pixelsPerSecond={pixelsPerSecond} scrollRef={scrollRef} />
        </div>
      </div>
    </div>
  );
}
