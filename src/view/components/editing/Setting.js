import React from 'react';
import classNames from 'classnames';
import inputComponents from './inputComponents';
import styles from './Setting.less';

export default function Setting({
  label,
  type = null,
  name,
  value,
  className,
  labelWidth = '50%',
  onChange,
  hidden,
  children,
  ...otherProps
}) {
  const [InputCompnent, inputProps] = inputComponents[type];

  return (
    <div className={classNames(styles.setting, className, { [styles.hidden]: hidden })}>
      <div className={styles.label} style={{ width: labelWidth }}>
        {label}
      </div>
      {InputCompnent && (
        <InputCompnent
          {...inputProps}
          {...otherProps}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
      {children}
    </div>
  );
}
