import { useEffect, useState } from 'react';
import { followPlayhead } from '@/lib/timeline/followPlayhead';
import transportStore from '@/lib/timeline/transport';

/** How often controls follow the playhead while playing, in ms (about 15 per second). */
export const PLAYHEAD_UI_INTERVAL = 66;

/**
 * The playhead time for UI that shows animated values (the controls panel),
 * without re-rendering on every frame: about 15 updates a second while
 * playing, and at once when paused, scrubbed or seeked. With `active` false
 * it never re-renders.
 */
export default function usePlayheadTime(active: boolean) {
  const [time, setTime] = useState(() => transportStore.getState().time);

  useEffect(() => {
    if (!active) return;
    return followPlayhead(transportStore, setTime, PLAYHEAD_UI_INTERVAL);
  }, [active]);

  return time;
}
