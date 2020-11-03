import React from 'react';
import Setting from 'components/controls/Setting';
import classNames from 'classnames';
import { inputValueToProps, mapChildren } from 'utils/react';
import styles from './Settings.less';

export default function Settings({ label, columns = [], className, children, onChange }) {
  const [labelWidth, inputWidth] = columns;

  function handleClone(child, props) {
    if (child.type === Setting) {
      return [child, props];
    }
    return [child];
  }

  return (
    <div className={classNames(styles.settings, className)}>
      {label && <div className={styles.label}>{label}</div>}
      {mapChildren(
        children,
        { labelWidth, inputWidth, onChange: inputValueToProps(onChange) },
        handleClone,
      )}
    </div>
  );
}
