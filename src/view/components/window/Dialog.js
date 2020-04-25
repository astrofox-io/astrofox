import React from 'react';
import classNames from 'classnames';
import Button from 'components/interface/Button';
import ButtonRow from 'components/layout/ButtonRow';
import styles from './Dialog.less';

export default function Dialog({ icon, message, buttons, onConfirm }) {
  return (
    <div className={styles.dialog}>
      <div className={styles.body}>
        {icon && <div className={classNames(styles.icon, icon)} />}
        <div className={styles.message}>{message}</div>
      </div>
      {buttons && (
        <ButtonRow>
          {buttons.map(button => (
            <Button text={button} onClick={() => onConfirm(button)} />
          ))}
        </ButtonRow>
      )}
    </div>
  );
}
