import React from 'react';
import { animated, useTransition } from 'react-spring';
import { easeInQuad } from 'utils/easing';
import styles from './Overlay.less';

export default function Overlay({ show, duration = 300, opacity = 0.5, easing = easeInQuad }) {
  const transitions = useTransition(show, null, {
    from: { opacity: 0 },
    enter: { opacity },
    leave: { opacity: 0 },
    config: { duration, easing },
  });

  return transitions.map(
    ({ item, key, props }) =>
      item && <animated.div key={key} className={styles.overlay} style={props} />,
  );
}
