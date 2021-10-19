import create from 'zustand';
import { videoRenderer, player } from 'global';

const initialState = {
  active: false,
  finished: false,
  status: '',
  frames: 0,
  currentFrame: 0,
  lastFrame: 0,
  startTime: 0,
};

const videoStore = create(() => ({ ...initialState }));

export function startRender(props) {
  player.stop();
  videoRenderer.init(props);

  setTimeout(() => {
    videoRenderer.start();
  }, 500);

  videoStore.setState({ ...initialState, active: true });
}

export function stopRender() {
  const { active } = videoStore.getState();

  if (active) {
    videoRenderer.stop();

    videoStore.setState(state => ({ ...state, active: false }));
  }
}

export function updateState(props) {
  videoStore.setState(state => ({ ...state, ...props }));
}

export default videoStore;
