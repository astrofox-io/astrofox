import { type MouseEvent as ReactMouseEvent, useEffect, useRef } from 'react';
import type { DragHandlers } from '@/lib/types';

export default function useMouseDrag() {
  const detach = useRef<(() => void) | null>(null);

  useEffect(() => () => detach.current?.(), []);

  function startDrag(e: ReactMouseEvent, { onDrag, onDragStart, onDragEnd }: DragHandlers = {}) {
    detach.current?.();
    let pending: MouseEvent | null = null;
    let lastEvent = e.nativeEvent;
    let frame: number | null = null;

    function flush() {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      const event = pending;
      pending = null;
      if (event) onDrag?.(event);
    }

    function move(event: MouseEvent) {
      lastEvent = pending = event;
      // Keep only the latest position until the next frame.
      frame ??= window.requestAnimationFrame(flush);
    }

    function cleanup() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', finish);
      window.removeEventListener('pointerup', finish, true);
      window.removeEventListener('pointercancel', cancel, true);
      window.removeEventListener('blur', cancel, true);
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      pending = null;
      detach.current = null;
    }

    function finish(event: MouseEvent) {
      if (pending) pending = event;
      try {
        flush();
      } finally {
        cleanup();
      }
      onDragEnd?.(event);
    }

    function cancel() {
      finish(lastEvent);
    }

    detach.current = cleanup;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', finish);
    // Flush before the history listener ends the gesture on pointerup.
    window.addEventListener('pointerup', finish, true);
    window.addEventListener('pointercancel', cancel, true);
    window.addEventListener('blur', cancel, true);

    onDragStart?.(e);
  }

  return startDrag;
}
