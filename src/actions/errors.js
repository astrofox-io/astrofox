import { createSlice } from '@reduxjs/toolkit';
import { logger } from 'view/global';

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

export const { setError, clearError } = errorStore.actions;

export default errorStore.reducer;

export function raiseError(message, error) {
  return dispatch => {
    if (error) {
      logger.error(`${message}\n`, error);
    }

    return dispatch(setError({ message, error }));
  };
}
