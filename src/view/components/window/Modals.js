import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Overlay from 'components/window/Overlay';
import ModalWindow from 'components/window/ModalWindow';
import * as modalComponents from 'components/modals';
import { closeModal } from 'actions/modals';

export default function Modals() {
  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);

  function handleClose() {
    dispatch(closeModal());
  }

  return (
    <Overlay>
      {modals.map(({ component, modalProps, componentProps }) => {
        const Component = modalComponents[component];
        return (
          <ModalWindow key={component} {...modalProps} onClose={handleClose}>
            {Component && <Component {...componentProps} onClose={handleClose} />}
          </ModalWindow>
        );
      })}
    </Overlay>
  );
}
