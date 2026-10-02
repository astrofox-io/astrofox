import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { useRef } from 'react';
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
  const drag = useRef<DragState | null>(null);

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
      originX: event.clientX,
      anchor: ref,
      keys,
      origin: captureKeys(keys),
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const state = drag.current;
    if (!state) return;

    const dx = event.clientX - state.originX;
    if (!state.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
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

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="absolute inset-0" onPointerDown={() => clearKeySelection()}>
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
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
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
