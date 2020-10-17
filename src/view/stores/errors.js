import create from 'zustand';
import { logger } from 'global';
import { showModal } from './modals';

const initialState = {
  error: null,
  message: null,
};

const useErrorStore = create(() => ({
  ...initialState,
}));

export function clearErrors() {
  useErrorStore.setState({ ...initialState });
}

export function raiseError(message, error) {
  if (error) {
    logger.error(`${message}\n`, error);
  }

  useErrorStore.setState({ message, error: error.toString() });

  showModal('ErrorDialog', { title: 'Error' });
}

export default useErrorStore;
