import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from 'components/window/Dialog';
import { Warning } from 'view/icons';
import { clearError } from 'actions/errors';

export default function ErrorDialog({ onClose }) {
  const dispatch = useDispatch();
  const message = useSelector(state => state.errors.message);

  function handleConfirm() {
    dispatch(clearError());
    onClose();
  }

  return <Dialog icon={Warning} message={message} buttons={['Ok']} onConfirm={handleConfirm} />;
}
