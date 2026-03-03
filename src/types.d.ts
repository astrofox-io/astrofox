declare module "fourier-transform" {
	function ft(input: Float32Array | number[]): Float64Array;
	export = ft;
}

declare module "window-function/blackman" {
	function blackman(i: number, N: number): number;
	export = blackman;
}

declare module "mime" {
	const mime: {
		getType(path: string): string | null;
		getExtension(type: string): string | null;
	};
	export = mime;
}

declare module "path-browserify" {
	export function parse(path: string): {
		root: string;
		dir: string;
		base: string;
		ext: string;
		name: string;
	};
	export function join(...paths: string[]): string;
	export function resolve(...paths: string[]): string;
	export function basename(path: string, ext?: string): string;
	export function dirname(path: string): string;
	export function extname(path: string): string;
}

declare module "react-motion" {
	import { Component, type ReactNode } from "react";

	interface SpringConfig {
		stiffness?: number;
		damping?: number;
		precision?: number;
	}

	interface OpaqueConfig {
		val: number;
		stiffness: number;
		damping: number;
		precision: number;
	}

	export function spring(val: number, config?: SpringConfig): OpaqueConfig;

	interface MotionProps {
		defaultStyle?: Record<string, number>;
		style: Record<string, number | OpaqueConfig>;
		children: (interpolatedStyle: Record<string, number>) => ReactNode;
		onRest?: () => void;
	}

	export class Motion extends Component<MotionProps> {}
}
