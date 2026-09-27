import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApp from '@/app/actions/app';
import {
  clearElementClip,
  pauseTransport,
  playTransport,
  seekTransport,
  setProjectDuration,
  setProjectFps,
  stepTransport,
  toggleTransport,
} from '@/app/actions/timeline';
import useTimelinePanel, {
  setTimelineHeight,
  setTimelineOpen,
  setTimelineSnap,
  setTimelineZoom,
  zoomTimelineIn,
  zoomTimelineOut,
} from '@/app/actions/timelinePanel';
import { Times } from '@/app/icons';
import NumberInput from '@/components/NumberInput';
import SelectInput from '@/components/SelectInput';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import transportStore, {
  MAX_PROJECT_DURATION,
  MIN_PROJECT_DURATION,
  TIMELINE_FPS_OPTIONS,
  type TimelineFps,
} from '@/lib/timeline/transport';
import { formatTimecode } from '@/lib/utils/format';
import { LABEL_WIDTH, MAX_TRACK_WIDTH, TRACK_PADDING } from './constants';
import Playhead from './Playhead';
import TimelineRows from './TimelineRows';
import TimelineRuler from './TimelineRuler';

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

/**
 * Bottom timeline: a ruler with the waveform, one bar per element, and the
 * playhead. Height is draggable from its top edge; zoom and snapping live in
 * the header. Keyboard: Space play/pause, ←/→ step a frame (Shift: a second),
 * Home/End, Delete resets the selected element's clip.
 */
export default function TimelinePanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'timeline' });
  const height = useTimelinePanel(state => state.height);
  const zoom = useTimelinePanel(state => state.zoom);
  const snap = useTimelinePanel(state => state.snap);
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

  const fitPixelsPerSecond = Math.max(
    1,
    (Math.max(0, viewportWidth - LABEL_WIDTH - TRACK_PADDING) || 600) / duration,
  );
  const pixelsPerSecond = Math.min(fitPixelsPerSecond * zoom, MAX_TRACK_WIDTH / duration);
  const trackWidth = Math.ceil(duration * pixelsPerSecond) + TRACK_PADDING;

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
      case 'Delete':
      case 'Backspace':
        if (activeElementId) {
          event.preventDefault();
          clearElementClip(activeElementId);
        }
        break;
      case 'k':
        pauseTransport();
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
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-neutral-800 px-3">
        <div className="text-xs uppercase text-neutral-400">{t('title')}</div>
        <TimeReadout fps={fps} />
        <div className="ml-auto flex items-center gap-3 text-xs text-neutral-400">
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
              onChange={(_name, value) => setProjectDuration(value)}
            />
            {explicitDuration ? (
              <button
                type="button"
                className="text-neutral-400 underline-offset-2 hover:text-neutral-100 hover:underline"
                title={t('follow-audio-help')}
                onClick={() => setProjectDuration(null)}
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
              onChange={(_name, value) => setProjectFps(Number(value) as TimelineFps)}
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
            <IconButton label={t('zoom-out')} onClick={zoomTimelineOut}>
              <ZoomOut className="size-3.5" />
            </IconButton>
            <IconButton label={t('zoom-in')} onClick={zoomTimelineIn}>
              <ZoomIn className="size-3.5" />
            </IconButton>
            <IconButton label={t('zoom-fit')} onClick={() => setTimelineZoom(1)}>
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
