/**
 * A deterministic random number generator (mulberry32). The same seed always
 * produces the same sequence, so randomized visuals can be rendered the same
 * way live, in a preview and in an export.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The frame a project time falls in at a frame rate, as a seed. */
export function frameSeed(time: number, fps: number, salt = 0): number {
  return (Math.floor(time * fps + 1e-6) * 2654435761 + salt) >>> 0;
}
