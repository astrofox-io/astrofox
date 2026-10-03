import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import {
  captureKeys,
  clearKeySelection,
  isKeySelected,
  type KeyRef,
  moveKeysFrom,
  selectKey,
} from '@/app/actions/keyframes';
import timelinePanelStore from '@/app/actions/timelinePanel';
import { snapTime } from '@/lib/timeline/clip';
import type { Keyframe } from '@/lib/timeline/tracks';
import transportStore, { seekTransport } from '@/lib/timeline/transport';

/** Pixels a key must be dragged before it moves, so a click never edits. */
const DRAG_THRESHOLD = 3;

interface KeyframeLaneProps {
  id: string;
  property: string;
  keyframes: readonly Keyframe[];
  pixelsPerSecond: number;
  fps: number;
  snap: boolean;
  /** Clip edges and other keys, for snapping a dragged key. */
  snapTargets: readonly number[];
  selectedKeys: readonly KeyRef[];
}

interface DragState {
  pointerId: number;
  captureTarget: HTMLElement;
  originX: number;
  /** The key under the pointer when the drag began; it is the one that snaps. */
  anchor: KeyRef;
  keys: KeyRef[];
  origin: ReturnType<typeof captureKeys>;
  moved: boolean;
}

/**
 * One animated property's keys under its element's bar. Click selects
 * (Shift adds), drag moves the selection, double-click puts the playhead on
 * the key. Hold keys are squares; eased keys are diamonds.
 */
export default function KeyframeLane({
  id,
  property,
  keyframes,
  pixelsPerSecond,
  fps,
  snap,
  snapTargets,
  selectedKeys,
}: KeyframeLaneProps) {
  const lane = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  const endDrag = useCallback(() => {
    const state = drag.current;
    drag.current = null;
    if (state?.captureTarget.hasPointerCapture(state.pointerId)) {
      state.captureTarget.releasePointerCapture(state.pointerId);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('blur', endDrag);
    return () => {
      window.removeEventListener('blur', endDrag);
      endDrag();
    };
  }, [endDrag]);

  function beginDrag(event: React.PointerEvent<HTMLButtonElement>, key: Keyframe) {
    if (event.button !== 0) return;
    event.stopPropagation();

    const ref = { id, property, time: key.time };
    const alreadySelected = isKeySelected(timelinePanelStore.getState().selectedKeys, ref);

    if (event.shiftKey) {
      selectKey(ref, true);
      return;
    }

    if (!alreadySelected) {
      selectKey(ref);
    }

    const keys = timelinePanelStore.getState().selectedKeys;
    drag.current = {
      pointerId: event.pointerId,
      captureTarget: event.currentTarget,
      originX: event.clientX,
      anchor: ref,
      keys,
      origin: captureKeys(keys),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || event.pointerId !== state.pointerId) return;

    const dx = event.clientX - state.originX;
    if (!state.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!state.moved && lane.current) {
      // Moving changes the button's React key and replaces it. Transfer capture
      // before editing, while keeping clicks and double-clicks on the button.
      state.captureTarget = lane.current;
      state.captureTarget.setPointerCapture(state.pointerId);
    }
    state.moved = true;

    const targets = [...snapTargets, transportStore.getState().time];
    const time = snapTime(
      state.anchor.time + dx / pixelsPerSecond,
      targets,
      pixelsPerSecond,
      snap,
      fps,
    );
    const moved = moveKeysFrom(state.origin, state.keys, time - state.anchor.time);
    timelinePanelStore.setState({ selectedKeys: moved });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerId !== drag.current?.pointerId) return;
    // Apply the release position before the window's history listener closes
    // the gesture, including a release outside the lane.
    handlePointerMove(event);
    endDrag();
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerId === drag.current?.pointerId) endDrag();
  }

  function handleLostPointerCapture(event: React.PointerEvent<HTMLDivElement>) {
    // Losing the button's capture during the handoff is expected.
    if (event.target === drag.current?.captureTarget) handlePointerCancel(event);
  }

  return (
    <div
      ref={lane}
      className="absolute inset-0 touch-none select-none"
      onPointerDown={() => clearKeySelection()}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
    >
      {keyframes.map(key => {
        const selected = isKeySelected(selectedKeys, { id, property, time: key.time });

        return (
          <button
            key={key.time}
            type="button"
            title={`${key.time.toFixed(3)}s · ${typeof key.value === 'number' ? Number(key.value.toFixed(3)) : key.value} · ${key.easing}`}
            aria-pressed={selected}
            className={classNames(
              'absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-grab border border-neutral-950 active:cursor-grabbing',
              key.easing === 'hold' ? 'rounded-[1px]' : 'rotate-45',
              selected ? 'z-10 bg-neutral-100' : 'bg-neutral-400 hover:bg-neutral-200',
            )}
            style={{ left: key.time * pixelsPerSecond }}
            onPointerDown={event => beginDrag(event, key)}
            onDoubleClick={event => {
              event.stopPropagation();
              seekTransport(key.time);
            }}
          />
        );
      })}
    </div>
  );
}
