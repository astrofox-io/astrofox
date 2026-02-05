import { clamp } from "utils/math";
import {
	DEFAULT_CANVAS_BGCOLOR,
	DEFAULT_CANVAS_HEIGHT,
	DEFAULT_CANVAS_WIDTH,
	DEFAULT_ZOOM,
} from "view/constants";
import { stage } from "view/global";
import create from "zustand";
import { touchProject } from "./project";

const initialState = {
	width: DEFAULT_CANVAS_WIDTH,
	height: DEFAULT_CANVAS_HEIGHT,
	backgroundColor: DEFAULT_CANVAS_BGCOLOR,
	zoom: DEFAULT_ZOOM,
	loading: false,
};

const stageStore = create(() => ({
	...initialState,
}));

export function updateStage(props) {
	stageStore.setState(props);

	stage.update(props);
}

export function updateCanvas(width, height, backgroundColor) {
	updateStage({ width, height, backgroundColor });

	touchProject();
}

export function setZoom(value) {
	updateStage({ zoom: clamp(value, 0.1, 1) });
}

export function zoomIn() {
	const { zoom } = stageStore.getState();

	const newValue = clamp(zoom - 0.1, 0.1, 1);

	updateStage({ zoom: newValue });
}

export function zoomOut() {
	const { zoom } = stageStore.getState();

	const newValue = clamp(zoom + 0.1, 0.1, 1.0);

	updateStage({ zoom: newValue });
}

export function fitToScreen() {
	const viewport = document.getElementById("viewport");
	const { width, height, zoom } = stageStore.getState();

	const newWidth = clamp((viewport.clientWidth * 0.8) / width, 0.1, 1);
	const newHeight = clamp((viewport.clientHeight * 0.8) / height, 0.1, 1);

	updateStage({ zoom: Math.min(newWidth, newHeight) });
}

export default stageStore;
