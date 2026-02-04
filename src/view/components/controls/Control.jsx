import React from 'react';
import classNames from 'classnames';
import Option from 'components/controls/Option';
import useEntity from 'hooks/useEntity';
import { inputValueToProps } from 'utils/react';
import { resolve } from 'utils/object';
import styles from './Control.module.less';

export default function Control({ display, className, showHeader = true }) {
  const {
    displayName,
    constructor: {
      config: { label, controls = {} },
    },
  } = display;

  const onChange = useEntity(display);

  function mapOption(name, option) {
    const props = {};

    for (const [name, value] of Object.entries(option)) {
      props[name] = resolve(value, [display]);
    }

    return (
      <Option
        key={name}
        display={display}
        name={name}
        value={display.properties[name]}
        onChange={inputValueToProps(onChange)}
        {...props}
      />
    );
  }

  return (
    <div className={classNames(styles.control, className)}>
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.label}>{label}</div>
            <div className={styles.displayName}>{displayName}</div>
          </div>
        </div>
      )}
      {Object.keys(controls).map(key => mapOption(key, controls[key]))}
    </div>
  );
}
