import React from 'react';
import classNames from 'classnames';
import styles from './CheckboxInput.module.less';

export default function CheckboxInput({
  name = 'checkbox',
  value = false,
  label,
  labelPosition = 'right',
  onChange,
}) {
  return (
    <div className={styles.checkbox}>
      <div
        className={classNames(styles.input, {
          [styles.checked]: value,
        })}
        onClick={() => onChange(name, !value)}
      />
      {label && (
        <div
          className={classNames(styles.label, {
            [styles.left]: labelPosition === 'left',
            [styles.right]: labelPosition === 'right',
          })}
        >
          {label}
        </div>
      )}
    </div>
  );
}
