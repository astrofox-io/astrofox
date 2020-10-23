import create from 'zustand';
import { api } from 'global';

const initialState = {
  plugins: {},
};

const pluginStore = create(() => ({
  ...initialState,
}));

export function loadPlugins() {
  const plugins = api.getPlugins();

  pluginStore.setState({ plugins });
}

export default pluginStore;
