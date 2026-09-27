/** Width of the sticky name column, in px. */
export const LABEL_WIDTH = 184;
/** Height of one element row, in px. */
export const ROW_HEIGHT = 26;
/** Height of the ruler (ticks + waveform), in px. */
export const RULER_HEIGHT = 44;
/** Widest track the panel will lay out; keeps the ruler canvas well under browser limits. */
export const MAX_TRACK_WIDTH = 12_000;
/** Distance within which edges snap to each other, in px. */
export const SNAP_DISTANCE = 6;
/** Right-hand padding after the project end, in px. */
export const TRACK_PADDING = 24;

export const CLIP_COLORS: Record<'scene' | 'display' | 'effect', string> = {
  scene: '#6b7280',
  display: '#704dd8',
  effect: '#d97706',
};
