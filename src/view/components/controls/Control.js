import React from 'react';
import classNames from 'classnames';
import Option from 'components/controls/Option';
import useEntity from 'hooks/useEntity';
import { inputValueToProps } from 'utils/react';
import { resolve } from 'utils/object';
import styles from './Control.less';

export default function Control({ display, className }) {
  const {
    displayName,
    constructor: {
      info: { label },
      controls = {},
    },
  } = display;

  const onChange = useEntity(display);

  return (
    <div className={classNames(styles.control, className)}>
      {label && (
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.label}>{label}</div>
            <div className={styles.displayName}>{displayName}</div>
          </div>
        </div>
      )}
      {Object.keys(controls).map(key => {
        const props = {};
        const option = controls[key];

        for (const [name, value] of Object.entries(option)) {
          props[name] = resolve(value, [display]);
        }

        return (
          <Option
            key={key}
            display={display}
            name={key}
            value={display.properties[key]}
            onChange={inputValueToProps(onChange)}
            {...props}
          />
        );
      })}
    </div>
  );
}
