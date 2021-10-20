import create from 'zustand';
import { logger } from 'global';
import { showModal } from './modals';

const initialState = {
  error: null,
  message: null,
};

const errorStore = create(() => ({
  ...initialState,
}));

export function clearError() {
  errorStore.setState({ ...initialState });
}

export function raiseError(message, error) {
  if (error) {
    logger.error(`${message}\n`, error);
  }

  errorStore.setState({ message, error: error.toString() });

  showModal('ErrorDialog', { title: 'Error' });
}

export default errorStore;
