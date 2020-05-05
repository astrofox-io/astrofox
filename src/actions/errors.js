import { createSlice } from '@reduxjs/toolkit';
import { logger } from 'view/global';
import { showModal } from 'actions/modals';

const initialState = {
  error: null,
  message: null,
};

const errorStore = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    setError(state, action) {
      state = action.payload;
      return state;
    },
    clearError() {
      return initialState;
    },
  },
});

const { setError, clearError } = errorStore.actions;

export { clearError };

export default errorStore.reducer;

export function raiseError(message, error) {
  return dispatch => {
    if (error) {
      logger.error(`${message}\n`, error);
    }

    dispatch(setError({ message, error: error.toString() }));
    dispatch(showModal('ErrorDialog', { title: 'Error' }));
  };
}
