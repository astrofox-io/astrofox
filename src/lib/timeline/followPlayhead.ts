/** The part of the transport store followPlayhead reads. */
interface PlayheadSource {
  getState(): { time: number; playing: boolean };
  subscribe(
    listener: (
      state: { time: number; playing: boolean },
      previous: { time: number; playing: boolean },
    ) => void,
  ): () => void;
}

/**
 * Call `onTime` with the playhead time now and whenever it moves, but at most
 * once every `interval` ms while playing, always ending on the latest time.
 * Paused, scrubbed and seeked times arrive at once, so a stopped playhead
 * reports exactly where it is. Returns a function that stops following.
 */
export function followPlayhead(
  source: PlayheadSource,
  onTime: (time: number) => void,
  interval: number,
  now: () => number = () => performance.now(),
) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const publish = () => {
    timer = null;
    last = now();
    onTime(source.getState().time);
  };

  publish();

  const unsubscribe = source.subscribe((state, previous) => {
    if (state.time === previous.time && state.playing === previous.playing) return;

    if (!state.playing) {
      cancel();
      publish();
      return;
    }

    const wait = interval - (now() - last);

    if (wait <= 0) {
      cancel();
      publish();
    } else if (!timer) {
      timer = setTimeout(publish, wait);
    }
  });

  return () => {
    unsubscribe();
    cancel();
  };
}
