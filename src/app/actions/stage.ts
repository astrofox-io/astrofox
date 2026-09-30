import { create } from 'zustand';
import { DEFAULT_ZOOM } from '@/app/constants';
import { projectDocument } from '@/app/document';
import { renderBackend, renderer } from '@/app/global';
import { clamp } from '@/lib/utils/math';

/** How the stage is viewed. Canvas size and color are document content (`projectDocument`). */
interface StageState {
  zoom: number;
  loading: boolean;
}

const initialState: StageState = {
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
  renderer.requestRender();
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
  const viewport = document.getElementById('viewport');

  if (!viewport) {
    return;
  }

  const { width, height } = projectDocument.getState().canvas;

  const newWidth = clamp((viewport.clientWidth * 0.8) / width, MIN_ZOOM, MAX_ZOOM);
  const newHeight = clamp((viewport.clientHeight * 0.8) / height, MIN_ZOOM, MAX_ZOOM);

  updateStage({ zoom: Math.min(newWidth, newHeight) });
}

export default stageStore;
