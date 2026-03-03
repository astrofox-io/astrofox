import { clamp } from "@/lib/utils/math";
import {
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
	DEFAULT_ZOOM,
} from "@/lib/view/constants";
import { renderBackend } from "@/lib/view/global";
import create from "zustand";
import { touchProject } from "./project";

interface StageState {
	width: number;
	height: number;
	backgroundColor: string;
	zoom: number;
	loading: boolean;
}

const initialState: StageState = {
	width: DEFAULT_CANVAS_WIDTH,
	height: DEFAULT_CANVAS_HEIGHT,
	backgroundColor: DEFAULT_CANVAS_BGCOLOR,
	zoom: DEFAULT_ZOOM,
	loading: false,
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const stageStore = create(() => ({
	...initialState,
}));

export function updateStage(props: Partial<StageState>) {
	stageStore.setState(props as StageState);

	renderBackend.update(props);
}

export function updateCanvas(
	width: number,
	height: number,
	backgroundColor: string,
) {
	updateStage({ width, height, backgroundColor });
	touchProject();
}

export function setZoom(value: number) {
	const nextValue = Number(value);

	if (!Number.isFinite(nextValue)) {
		return;
	}

	updateStage({ zoom: clamp(nextValue, MIN_ZOOM, MAX_ZOOM) });
}

export function zoomIn() {
	const { zoom } = stageStore.getState();

	const newValue = clamp(zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

	updateStage({ zoom: newValue });
}

export function zoomOut() {
	const { zoom } = stageStore.getState();

	const newValue = clamp(zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

	updateStage({ zoom: newValue });
}

export function fitToScreen() {
	const viewport = document.getElementById("viewport");

	if (!viewport) {
		return;
	}

	const { width, height } = stageStore.getState();

	const newWidth = clamp(
		(viewport.clientWidth * 0.8) / width,
		MIN_ZOOM,
		MAX_ZOOM,
	);
	const newHeight = clamp(
		(viewport.clientHeight * 0.8) / height,
		MIN_ZOOM,
		MAX_ZOOM,
	);

	updateStage({ zoom: Math.min(newWidth, newHeight) });
}

export default stageStore;
