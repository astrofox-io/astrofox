import React from 'react';
import classNames from 'classnames';
import styles from './ToggleInput.less';

export default function ToggleInput({ name, value, label, position = 'left', onChange }) {
  return (
    <div className={styles.toggle}>
      <div
        className={classNames(styles.input, {
          [styles.on]: value,
        })}
        onClick={() => onChange(name, !value)}
      />
      {label && (
        <div
          className={classNames(styles.label, {
            [styles.left]: position === 'left',
            [styles.right]: position === 'right',
          })}
        >
          {label}
        </div>
      )}
    </div>
  );
}
