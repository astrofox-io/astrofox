import React from 'react';
import { env } from 'global';
import Button from 'components/interface/Button';
import styles from './About.less';

const { APP_NAME, APP_VERSION } = env;

export default function About({ onClose }) {
  return (
    <div className={styles.about}>
      <div className={styles.name}>{APP_NAME}</div>
      <div className={styles.version}>{`Version ${APP_VERSION}`}</div>
      <div className={styles.copyright}>{'Copyright \u00A9 Mike Cao'}</div>
      <div className={styles.buttons}>
        <Button text="Close" onClick={onClose} />
      </div>
    </div>
  );
}
