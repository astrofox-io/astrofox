import React from 'react';
import propTypes from 'prop-types';

import UIComponent from '../UIComponent';
import Button from  '../interface/Button';
import Checkmark from '../interface/Checkmark';
import Spinner from '../interface/Spinner';

export default class AppUpdates extends UIComponent {
    constructor(props, context) {
        super(props);

        this.appUpdater = context.app.updater;

        this.state = {
            message: null
        };
    }

    componentDidMount() {
        let appUpdater = this.appUpdater;

        appUpdater.on('update', this.updateStatus, this);

        if (!appUpdater.checking &&
            !appUpdater.downloading &&
            !appUpdater.downloadComplete) {
            appUpdater.checkForUpdates();
        }

        this.updateStatus();
    }

    componentWillUnmount() {
        this.appUpdater.off('update', this.updateStatus, this);
    }

    updateStatus() {
        let appUpdater = this.appUpdater;

        if (appUpdater.error) {
            this.setState({ message: 'Unable to check for updates.' });
        }
        else if (appUpdater.downloading) {
            this.setState({ message: 'Downloading update...' });
        }
        else if (appUpdater.downloadComplete) {
            let version = appUpdater.versionInfo.version;
            this.setState({ message: `A new update (${version}) is ready to install.` });
        }
        else if (appUpdater.installing) {
            this.setState({ message: 'Installing update...' });
        }
        else if (appUpdater.checking) {
            this.setState({ message: 'Checking for updates...' });
        }
        else if (appUpdater.hasUpdate) {
            let version = appUpdater.versionInfo.version;
            this.setState({ message: `A new update (${version}) is available to download and install.` });
        }
        else {
            this.setState({ message: 'You have the latest version.' });
        }
    }

    installUpdate() {
        this.appUpdater.quitAndInstall();
    }

    downloadUpdate() {
        this.appUpdater.downloadUpdate();
    }

    render() {
        let icon,
            installButton,
            downloadButton,
            closeText = 'Close',
            { checking, installing, downloading, downloadComplete, hasUpdate } = this.appUpdater;

        if (checking || downloading || installing) {
            icon = <Spinner className="icon" size={30} />;
        }

        if (downloadComplete && !installing) {
            installButton = <Button text="Restart and Install Now" onClick={this.installUpdate}/>;
            closeText = 'Install Later';
        }

        if (hasUpdate && !downloading && !downloadComplete) {
            downloadButton = <Button text="Download Now" onClick={this.downloadUpdate} />;
        }

        if (!hasUpdate && !icon) {
            icon = <Checkmark className="icon" size={30} />;
        }

        return (
            <div className="updates">
                <div className="message">
                    {icon}
                    {this.state.message}
                </div>
                <div className="buttons">
                    {installButton}
                    {downloadButton}
                    <Button text={closeText} onClick={this.props.onClose} />
                </div>
            </div>
        );
    }
}

AppUpdates.contextTypes = {
    app: propTypes.object
};