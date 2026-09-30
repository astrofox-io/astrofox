import type React from 'react';

// --- Render pipeline ---

/**
 * Everything a frame is drawn from. Built by `Renderer` for one project time,
 * the same way live, in previews and in exports. Anything that animates must
 * derive from `time` (see `Phase`), never from wall-clock time or frame counts.
 */
export interface RenderFrameData {
  id: number;
  /**
   * Milliseconds since the previous frame: wall clock live, 1000/fps offline.
   * Only for smoothing; content must not accumulate it (use `time`).
   */
  delta: number;
  /** Absolute project time in seconds. */
  time: number;
  /** Project duration in seconds. */
  duration: number;
  /** Frame rate: the project's live, the export's offline. */
  fps: number;
  fft: Uint8Array | null;
  td: Float32Array | null;
  volume: number;
  gain: number;
  audioPlaying: boolean;
  /** True when the audio analysis and reactor output were updated for this frame. */
  hasUpdate: boolean;
  /** True when project time is advancing: transport playing, or an offline frame. */
  playing: boolean;
  /** True for export and preview frames, rendered at a chosen time rather than the playhead. */
  offline: boolean;
  reactors: Record<string, number>;
  inputMode?: 'file' | 'microphone' | 'midi' | 'desktop' | null;
  isLive?: boolean;
  sourceLabel?: string;
  midiActivity?: number;
}

export interface ReactorConfig {
  id: string;
  min: number;
  max: number;
}

export interface ReactorResult {
  fft: Float32Array | number[];
  output: number;
}

// --- Canvas ---

export type CanvasContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
export type CanvasElement = OffscreenCanvas | HTMLCanvasElement;

// --- Event system ---

export type EventCallback = (...args: unknown[]) => void;

// --- Drag handlers ---

export interface DragHandlers {
  onDrag?: (e: MouseEvent) => void;
  onDragStart?: (e: MouseEvent | React.MouseEvent) => void;
  onDragEnd?: (e: MouseEvent) => void;
}
