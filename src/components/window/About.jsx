import React from 'react';
import { APP_NAME, APP_VERSION } from 'core/Environment';
import Button from 'components/interface/Button';
import withAppContext from 'components/hocs/withAppContext';
import styles from './About.less';

const About = ({ app: { license }, onClose }) => {
    const info = license.info();

    return (
        <div className={styles.about}>
            <div className={styles.name}>
                {APP_NAME}
            </div>
            <div className={styles.version}>
                {`Version ${APP_VERSION}`}
            </div>
            <div className={styles.copyright}>
                {'Copyright \u00A9 Mike Cao'}
            </div>
            {
                info && info.user && (
                    <div className="license-info">
                        {`Licensed to ${info.user}`}
                    </div>
                )
            }
            <div className={styles.buttons}>
                <Button text="Close" onClick={onClose} />
            </div>
        </div>
    );
};

export default withAppContext(About);
