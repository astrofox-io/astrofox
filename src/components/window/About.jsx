import React from 'react';
import propTypes from 'prop-types';

import { APP_NAME, APP_VERSION } from 'core/Environment';
import Button from 'components/interface/Button';

const About = (props, context) => {
    let info = context.app.license.info(),
        licenseInfo = info.user !== undefined ?
            <div className="license-info">{`Licensed to ${info.user}`}</div> :
            null;

    return (
        <div className="about">
            <div className="name">
                {APP_NAME}
            </div>
            <div className="version">
                {`Version ${APP_VERSION}`}
            </div>
            <div className="copyright">
                {'Copyright \u00A9 Mike Cao'}
            </div>
            {licenseInfo}
            <div className="buttons">
                <Button text="Close" onClick={props.onClose} />
            </div>
        </div>
    );
};

About.contextTypes = {
    app: propTypes.object
};

export default About;