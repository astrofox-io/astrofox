import create from 'zustand';
import { videoRenderer, player } from 'global';

const initialState = {
  rendering: false,
};

const videoStore = create(() => ({ ...initialState }));

export function startRender(props) {
  player.stop();
  videoRenderer.init(props);

  setTimeout(() => {
    videoRenderer.start();
  }, 500);

  videoStore.setState({ ...props, rendering: true });
}

export function stopRender(props) {
  if (videoStore.getState().rendering) {
    videoRenderer.stop();

    videoStore.setState({ ...props, rendering: false });
  }
}

export default videoStore;
