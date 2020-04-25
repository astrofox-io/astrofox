import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const modalStore = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    setModals(state, action) {
      state = action.payload;
      return state;
    },
  },
});

export const { setModals } = modalStore.actions;

export default modalStore.reducer;

export function showModal(component, modalProps, componentProps) {
  return (dispatch, getState) => {
    const { modals } = getState();

    dispatch(setModals(modals.concat({ component, modalProps, componentProps })));
  };
}

export function closeModal() {
  return (dispatch, getState) => {
    const { modals } = getState();

    if (modals.length) {
      dispatch(setModals(modals.slice(0, modals.length - 1)));
    }
  };
}
