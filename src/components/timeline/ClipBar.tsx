import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { useRef } from 'react';
import timelinePanelStore from '@/app/actions/timelinePanel';
import { projectDocument } from '@/app/document';
import type { DocumentOp } from '@/lib/document/types';
import { type Clip, clipRange, editClip, snapTime } from '@/lib/timeline/clip';
import { shiftTracks, type Tracks } from '@/lib/timeline/tracks';
import { CLIP_COLORS } from './constants';

type DragMode = 'move' | 'trim-start' | 'trim-end';

interface ClipBarProps {
  id: string;
  type: 'scene' | 'display' | 'effect';
  clip: Clip | null;
  duration: number;
  fps: number;
  pixelsPerSecond: number;
  snap: boolean;
  active: boolean;
  enabled: boolean;
  /** Times other bars and the playhead sit at, for edge snapping. */
  snapTargets: readonly number[];
  onSelect: (id: string) => void;
}

interface DragState {
  mode: DragMode;
  originX: number;
  clip: Clip | null;
  /** The element's keys when a move began, when they move with the bar. */
  tracks: Tracks | null;
  /** How far those keys have moved so far in this drag. */
  lastShift?: number;
}

/** The element's keys, when moving its bar should carry them. */
function tracksToCarry(id: string, mode: DragMode): Tracks | null {
  if (mode !== 'move' || !timelinePanelStore.getState().moveKeys) return null;
  const state = projectDocument.getState();
  const tracks = (state.elementById[id] ?? state.sceneById[id])?.tracks;
  return tracks && Object.keys(tracks).length > 0 ? tracks : null;
}

/**
 * One element's bar on the timeline: drag to move, drag either edge to trim,
 * double-click to reset to the whole project. Fades show as darkened wedges.
 */
export default function ClipBar({
  id,
  type,
  clip,
  duration,
  fps,
  pixelsPerSecond,
  snap,
  active,
  enabled,
  snapTargets,
  onSelect,
}: ClipBarProps) {
  const drag = useRef<DragState | null>(null);
  const { start, end, openEnd } = clipRange(clip, duration);
  const left = start * pixelsPerSecond;
  const width = Math.max(2, (end - start) * pixelsPerSecond);
  const color = CLIP_COLORS[type];

  function beginDrag(event: React.PointerEvent<HTMLDivElement>, mode: DragMode) {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelect(id);
    drag.current = { mode, originX: event.clientX, clip, tracks: tracksToCarry(id, mode) };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    const delta = (event.clientX - state.originX) / pixelsPerSecond;
    const range = clipRange(state.clip, duration);
    const edit =
      state.mode === 'move'
        ? { type: 'move' as const, delta }
        : {
            type: state.mode,
            time: (state.mode === 'trim-start' ? range.start : range.end) + delta,
          };
    const patch = editClip(state.clip, edit, {
      duration,
      fps,
      snap: time => snapTime(time, snapTargets, pixelsPerSecond, snap, fps),
    });
    const ops: DocumentOp[] = [{ type: 'setClip', id, patch }];

    // Keys re-apply from where they were when the drag began, by however far
    // the clip's start actually moved (after snapping and limits).
    if (state.tracks && patch.start != null) {
      const { tracks, shift } = shiftTracks(state.tracks, patch.start - range.start);

      for (const [property, track] of Object.entries(tracks)) {
        ops.push({ type: 'setTrack', id, property, keyframes: track.keyframes });
      }

      // Selected keys of this element move with it.
      const { selectedKeys } = timelinePanelStore.getState();
      if (selectedKeys.some(key => key.id === id)) {
        const before = state.lastShift ?? 0;
        timelinePanelStore.setState({
          selectedKeys: selectedKeys.map(key =>
            key.id === id ? { ...key, time: key.time + shift - before } : key,
          ),
        });
      }
      state.lastShift = shift;
    }

    projectDocument.apply(ops);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const title = `${start.toFixed(2)}s – ${openEnd ? '∞' : `${end.toFixed(2)}s`}${
    clip?.fadeIn ? ` · in ${clip.fadeIn.toFixed(2)}s` : ''
  }${clip?.fadeOut ? ` · out ${clip.fadeOut.toFixed(2)}s` : ''}`;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: The bar is a pointer-driven drag surface; the row's name cell is the keyboard target.
    <div
      title={title}
      className={classNames(
        'absolute top-1 bottom-1 cursor-grab select-none rounded-sm active:cursor-grabbing',
        {
          'opacity-40': !enabled,
          'ring-1 ring-neutral-100': active,
        },
      )}
      style={{
        left,
        width,
        backgroundColor: color,
        opacity: enabled ? (clip ? 0.85 : 0.35) : undefined,
      }}
      onPointerDown={event => beginDrag(event, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={event => {
        event.stopPropagation();
        projectDocument.apply({ type: 'clearClip', id });
      }}
    >
      {clip && clip.fadeIn > 0 ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-l-sm"
          style={{
            width: Math.min(width, clip.fadeIn * pixelsPerSecond),
            background: 'linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0))',
          }}
        />
      ) : null}
      {clip && clip.fadeOut > 0 && !openEnd ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 rounded-r-sm"
          style={{
            width: Math.min(width, clip.fadeOut * pixelsPerSecond),
            background: 'linear-gradient(to left, rgba(0,0,0,0.65), rgba(0,0,0,0))',
          }}
        />
      ) : null}
      <div
        className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize rounded-l-sm hover:bg-white/30"
        onPointerDown={event => beginDrag(event, 'trim-start')}
      />
      <div
        className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize rounded-r-sm hover:bg-white/30"
        onPointerDown={event => beginDrag(event, 'trim-end')}
      />
    </div>
  );
}
