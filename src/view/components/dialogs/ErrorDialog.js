import React from 'react';
import Dialog from 'components/window/Dialog';
import { Warning } from 'view/icons';
import useError, { clearError } from 'actions/error';

export default function ErrorDialog({ onClose }) {
  const message = useError(state => state.errors.message);

  function handleConfirm() {
    clearError();
    onClose();
  }

  return <Dialog icon={Warning} message={message} buttons={['Ok']} onConfirm={handleConfirm} />;
}
