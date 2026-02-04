import React from 'react';
import { useTransition, animated } from 'react-spring';
import ModalWindow from 'components/window/ModalWindow';
import * as modalComponents from 'components/modals';
import Overlay from 'components/window/Overlay';
import { easeInOutQuad } from 'utils/easing';
import useModals, { closeModal } from 'actions/modals';
import styles from './Modals.module.less';

export default function Modals() {
  const modals = useModals(state => state.modals);

  const transitions = useTransition(modals, {
    keys: item => item.id,
    from: { opacity: 0, transform: 'scale(0.7) rotateX(-90deg)' },
    enter: { opacity: 1, transform: 'scale(1.0) rotateX(0deg)' },
    leave: { opacity: 0, transform: 'scale(0.7) rotateX(-90deg)' },
    config: { duration: 300, easing: easeInOutQuad },
  });

  function handleClose() {
    closeModal();
  }

  return transitions((style, item) => {
    const { component, modalProps, componentProps } = item;
    const Component = modalComponents[component];
    return (
      <div className={styles.container} key={component}>
        <Overlay show={!!modals.length} />
        <animated.div className={styles.modal} style={style}>
          <ModalWindow {...modalProps} onClose={handleClose}>
            {Component && <Component {...componentProps} onClose={handleClose} />}
          </ModalWindow>
        </animated.div>
      </div>
    );
  });
}
