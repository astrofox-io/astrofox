import React from 'react';
import Dialog from 'components/window/Dialog';
import { Warning } from 'view/icons';

export default function ErrorDialog({ message, onClose }) {
  return <Dialog icon={Warning} message={message} buttons={['Ok']} onConfirm={onClose} />;
}
