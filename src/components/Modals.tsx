// @ts-nocheck

import { useRef } from 'react';
import useModals, { closeModal, removeModal } from '@/app/actions/modals';
import About from '@/components/About';
import AppSettings from '@/components/AppSettings';
import CanvasSettings from '@/components/CanvasSettings';
import ErrorDialog from '@/components/ErrorDialog';
import ManagePlugins from '@/components/ManagePlugins';
import MissingPlugins from '@/components/MissingPlugins';
import ModalWindow from '@/components/ModalWindow';
import RelinkMediaDialog from '@/components/RelinkMediaDialog';
import SaveVideoDialog from '@/components/SaveVideoDialog';
import UnsavedChangesDialog from '@/components/UnsavedChangesDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const modalComponents = {
  About,
  AppSettings,
  CanvasSettings,
  ErrorDialog,
  ManagePlugins,
  MissingPlugins,
  RelinkMediaDialog,
  SaveVideoDialog,
  UnsavedChangesDialog,
};

export default function Modals() {
  const modals = useModals(state => state.modals);
  const afterCloseCallbacks = useRef(new Map());

  function handleClose(id: string) {
    closeModal(id);
  }

  function handleCloseComplete(id: string) {
    const afterClose = afterCloseCallbacks.current.get(id);
    afterCloseCallbacks.current.delete(id);
    removeModal(id);

    if (afterClose) {
      window.requestAnimationFrame(afterClose);
    }
  }

  function handleCloseAndThen(id: string, afterClose: () => void) {
    afterCloseCallbacks.current.set(id, afterClose);
    closeModal(id);
  }

  return modals.map(item => {
    const { id, component, modalProps, componentProps, open } = item;
    const Component = modalComponents[component];

    return (
      <Dialog
        key={id}
        open={open}
        onOpenChange={nextOpen => !nextOpen && handleClose(id)}
        onOpenChangeComplete={nextOpen => !nextOpen && handleCloseComplete(id)}
      >
        <DialogContent
          keepMounted
          initialFocus={component === 'CanvasSettings' ? false : undefined}
          showCloseButton={false}
          className="w-auto max-h-[85vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 p-0 text-neutral-100 sm:max-w-[calc(100%-2rem)]"
        >
          <ModalWindow {...modalProps} onClose={() => handleClose(id)}>
            {Component && (
              <Component
                {...componentProps}
                onClose={() => handleClose(id)}
                onCloseAndThen={afterClose => handleCloseAndThen(id, afterClose)}
              />
            )}
          </ModalWindow>
        </DialogContent>
      </Dialog>
    );
  });
}
