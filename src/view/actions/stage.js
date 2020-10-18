import create from 'zustand';
import {
  DEFAULT_CANVAS_BGCOLOR,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_ZOOM,
} from 'view/constants';
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

export function updateCanvas(width, height, backgroundColor) {
  stageStore.setState({ width, height, backgroundColor });

  touchProject();
}

export function setZoom(zoom) {
  stageStore.setState({ zoom });
}

export default stageStore;
