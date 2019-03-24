import React, { Children, cloneElement } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import styles from './Overlay.less';

const classes = {
  enter: styles.overlayEnter,
  enterActive: styles.overlayEnterActive,
  exit: styles.overlayExit,
  exitActive: styles.overlayExitActive,
};

const timeout = {
  enter: 300,
  exit: 300,
};

const Component = ({ children }) => (
  <div
    className={classNames({
      [styles.overlay]: true,
      [styles.hidden]: Children.count(children) === 0,
    })}
  >
    {children}
  </div>
);

const Overlay = ({ children }) => (
  <TransitionGroup component={Component}>
    {Children.map(children, (child, index) => (
      <CSSTransition key={index} classNames={classes} timeout={timeout}>
        {cloneElement(child, { className: styles.element })}
      </CSSTransition>
    ))}
  </TransitionGroup>
);

export default Overlay;
