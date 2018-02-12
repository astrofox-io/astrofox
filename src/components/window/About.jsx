import React from 'react';
import PropTypes from 'prop-types';
import { APP_NAME, APP_VERSION } from 'core/Environment';
import Button from 'components/interface/Button';
import styles from './About.less';

const About = ({ onClose }, context) => {
    const info = context.app.license.info();

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
                info && info.user &&
                <div className="license-info">
                    {`Licensed to ${info.user}`}
                </div>
            }
            <div className={styles.buttons}>
                <Button text="Close" onClick={onClose} />
            </div>
        </div>
    );
};

About.contextTypes = {
    app: PropTypes.object,
};

export default About;
