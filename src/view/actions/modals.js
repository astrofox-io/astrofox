import create from 'zustand';
import { uniqueId } from 'utils/crypto';

const initialState = {
  modals: [],
};

const modalStore = create(() => ({
  ...initialState,
}));

export function showModal(component, modalProps, componentProps) {
  modalStore.setState(state => ({
    modals: state.modals.concat({ id: uniqueId(), component, modalProps, componentProps }),
  }));
}

export function closeModal() {
  modalStore.setState(state => ({ modals: state.modals.slice(0, state.length - 1) }));
}

export default modalStore;
