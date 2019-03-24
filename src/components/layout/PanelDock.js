import React, { PureComponent, Children, cloneElement } from 'react';
import classNames from 'classnames';
import styles from './PanelDock.less';

export default class PanelDock extends PureComponent {
  static defaultProps = {
    direction: 'vertical',
    width: 320,
    visible: true,
  };

  render() {
    const { width, direction, visible, children } = this.props;

    return (
      <div
        ref={e => (this.domElement = e)}
        className={classNames({
          [styles.dock]: true,
          [styles.vertical]: direction === 'vertical',
          [styles.horizontal]: direction !== 'vertical',
          [styles.hidden]: !visible,
        })}
        style={{
          width,
        }}
      >
        {Children.map(children, child => cloneElement(child, { dock: this }))}
      </div>
    );
  }
}
