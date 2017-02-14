import React from 'react';

import { APP_NAME, APP_VERSION } from '../../core/Environment';
import Button from './Button';

const About = (props) => {
    return (
        <div className="about">
            <div className="name">{APP_NAME}</div>
            <div className="version">{`Version ${APP_VERSION}`}</div>
            <div className="copyright">Copyright (c) Mike Cao</div>
            <div className="buttons">
                <Button text="Close" onClick={props.onClose} />
            </div>
        </div>
    );
};

export default About;