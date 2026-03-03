import type React from "react";

// --- Render pipeline ---

export interface RenderFrameData {
	id: number;
	delta: number;
	fft: Uint8Array | null;
	td: Float32Array | null;
	volume: number;
	gain: number;
	audioPlaying: boolean;
	hasUpdate: boolean;
	reactors: Record<string, number>;
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

export type CanvasContext =
	| OffscreenCanvasRenderingContext2D
	| CanvasRenderingContext2D;
export type CanvasElement = OffscreenCanvas | HTMLCanvasElement;

// --- Event system ---

export type EventCallback = (...args: unknown[]) => void;

// --- Drag handlers ---

export interface DragHandlers {
	onDrag?: (e: MouseEvent) => void;
	onDragStart?: (e: MouseEvent | React.MouseEvent) => void;
	onDragEnd?: (e: MouseEvent) => void;
}
