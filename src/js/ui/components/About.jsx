import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';
import { APP_VERSION } from '../../core/Environment';

export default class About extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            checking: false
        };
    }

    componentDidMount() {
        Application.updater.on('check-complete', this.showResponse);
    }

    componentWillUnmount() {
        Application.updater.off('check-complete', this.showResponse);
    }

    onUpdateCheck() {
        this.setState({ checking: true });

        Application.updater.checkForUpdates();
    }

    showResponse(res) {
        let v = res.versionInfo.version;

        this.setState({ msg: `New version ${v} is available.`, checking: false});
    }

    render() {
        return (
            <div className="about">
                <div><img src="images/about_banner.jpg"/></div>
                <div>{`Version ${APP_VERSION}`}</div>
                <div className="button center" onClick={this.onUpdateCheck}>{'Check For Updates'}</div>
                <div>{this.state.msg}</div>
            </div>
        );
    }
}