import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTransition, animated } from 'react-spring';
import ModalWindow from 'components/window/ModalWindow';
import * as modalComponents from 'components/modals';
import Overlay from 'components/window/Overlay';
import { easeInOutQuad } from 'utils/easing';
import { closeModal } from 'actions/modals';
import styles from './Modals.less';

export default function Modals() {
  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);

  const transitions = useTransition(modals, modal => modal.id, {
    from: { opacity: 0, transform: 'scale(0.7) rotateX(-90deg)' },
    enter: { opacity: 1, transform: 'scale(1.0) rotateX(0deg)' },
    leave: { opacity: 0, transform: 'scale(0.7) rotateX(-90deg)' },
    config: { duration: 300, easing: easeInOutQuad },
  });

  function handleClose() {
    dispatch(closeModal());
  }

  return transitions.map(({ item, key, props }) => {
    const { component, modalProps, componentProps } = item;
    const Component = modalComponents[component];
    return (
      <div className={styles.container} key={component}>
        <Overlay show={!!modals.length} />
        <animated.div key={key} className={styles.modal} style={props}>
          <ModalWindow {...modalProps} onClose={handleClose}>
            {Component && <Component {...componentProps} onClose={handleClose} />}
          </ModalWindow>
        </animated.div>
      </div>
    );
  });
}
