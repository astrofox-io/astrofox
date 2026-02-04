import create from 'zustand';
import { uniqueId } from 'utils/crypto';

const initialState = {
  modals: [],
};

const modalStore = create(() => ({
  ...initialState,
}));

export function showModal(component, modalProps, componentProps) {
  modalStore.setState(({ modals }) => ({
    modals: modals.concat({ id: uniqueId(), component, modalProps, componentProps }),
  }));
}

export function closeModal() {
  modalStore.setState(({ modals }) => ({ modals: modals.slice(0, -1) }));
}

export default modalStore;
