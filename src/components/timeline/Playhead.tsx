import type React from 'react';
import { useEffect } from 'react';
import transportStore from '@/lib/timeline/transport';
import { LABEL_WIDTH } from './constants';

interface PlayheadProps {
  pixelsPerSecond: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * The vertical playhead line. Subscribes to the transport on its own so the
 * rows do not re-render every frame, and keeps itself in view while playing.
 */
export default function Playhead({ pixelsPerSecond, scrollRef }: PlayheadProps) {
  const time = transportStore(state => state.time);
  const playing = transportStore(state => state.playing);
  const x = LABEL_WIDTH + time * pixelsPerSecond;

  useEffect(() => {
    const container = scrollRef.current;
    if (!playing || !container) return;

    const left = container.scrollLeft + LABEL_WIDTH;
    const right = container.scrollLeft + container.clientWidth;

    if (x < left || x > right - 8) {
      container.scrollLeft = Math.max(0, x - LABEL_WIDTH - 40);
    }
  }, [x, playing, scrollRef]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-neutral-100"
      style={{ left: x }}
    >
      <div className="absolute -top-px -left-[5px] h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-neutral-100" />
    </div>
  );
}
