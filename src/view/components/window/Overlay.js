import React from 'react';
import { animated, useTransition } from 'react-spring';
import { easeInQuad } from 'utils/easing';
import styles from './Overlay.less';

export default function Overlay({ show, duration = 300, opacity = 0.5, easing = easeInQuad }) {
  const transitions = useTransition(show, {
    from: { opacity: 0 },
    enter: { opacity },
    leave: { opacity: 0 },
    config: { duration, easing },
  });

  return transitions(
    (style, item) => item && <animated.div className={styles.overlay} style={style} />,
  );
}
