import create from 'zustand';
import { stage } from 'view/global';
import {
  DEFAULT_CANVAS_BGCOLOR,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_ZOOM,
} from 'view/constants';
import { clamp } from 'utils/math';
import { touchProject } from './project';

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
  const { zoom } = stageStore.getState();

  const newValue = value === 0 ? 100 : clamp(zoom + value * 10, 10, 100);

  updateStage({ zoom: newValue });
}

export default stageStore;
