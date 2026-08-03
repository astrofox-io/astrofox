import { create } from 'zustand';
import { logger } from '@/app/global';
import { showModal } from './modals';

interface ErrorState {
  error: string | null;
  message: string | null;
}

const initialState: ErrorState = {
  error: null,
  message: null,
};

const errorStore = create<ErrorState>(() => ({
  ...initialState,
}));

interface RaiseErrorOptions {
  logLevel?: 'error' | 'warn' | 'none';
}

export function clearError() {
  errorStore.setState({ ...initialState });
}

export function raiseError(message: string, error?: unknown, options: RaiseErrorOptions = {}) {
  if (error) {
    const logLevel = options.logLevel ?? 'error';

    if (logLevel === 'warn') {
      logger.warn(`${message}\n`, String(error));
    } else if (logLevel === 'error') {
      logger.error(`${message}\n`, String(error));
    }
  }

  errorStore.setState({ message, error: error ? String(error) : null });

  showModal('ErrorDialog', { titleKey: 'errors.title' });
}

export default errorStore;
