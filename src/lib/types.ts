import type React from 'react';

// --- Render pipeline ---

export interface RenderFrameData {
  id: number;
  /** Milliseconds since the previous frame (wall clock, or 1000/fps when exporting). */
  delta: number;
  /** Absolute project time in seconds, from the transport (or frame/fps when exporting). */
  time: number;
  /** Project duration in seconds. */
  duration: number;
  /** Project frame rate; keyframe/clip snapping and export cadence. */
  fps: number;
  fft: Uint8Array | null;
  td: Float32Array | null;
  volume: number;
  gain: number;
  audioPlaying: boolean;
  hasUpdate: boolean;
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
