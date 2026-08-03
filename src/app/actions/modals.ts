import { create } from 'zustand';
import { uniqueId } from '@/lib/utils/crypto';

interface Modal {
  id: string;
  component: string;
  open: boolean;
  modalProps?: Record<string, unknown>;
  componentProps?: Record<string, unknown>;
}

interface ModalState {
  modals: Modal[];
}

const initialState: ModalState = {
  modals: [],
};

const modalStore = create(() => ({
  ...initialState,
}));

export function showModal(
  component: string,
  modalProps?: Record<string, unknown>,
  componentProps?: Record<string, unknown>,
) {
  modalStore.setState(({ modals }: ModalState) => ({
    modals: modals.concat({
      id: uniqueId(),
      component,
      open: true,
      modalProps,
      componentProps,
    }),
  }));
}

export function closeModal(id?: string) {
  modalStore.setState(({ modals }: ModalState) => ({
    modals: modals.map((modal, index) => {
      const isTarget = id ? modal.id === id : index === modals.length - 1;

      if (!isTarget) {
        return modal;
      }

      return {
        ...modal,
        open: false,
      };
    }),
  }));
}

export function removeModal(id?: string) {
  modalStore.setState(({ modals }: ModalState) => ({
    modals: modals.filter((modal, index) => (id ? modal.id !== id : index !== modals.length - 1)),
  }));
}

export default modalStore;
