import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';
import Button from  '../components/Button';
import Spinner from '../components/Spinner';

const appUpdater = Application.updater;

export default class AppUpdates extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            message: null
        };
    }

    componentDidMount() {
        appUpdater.on('update', this.updateStatus, this);

        if (!appUpdater.hasUpdate &&
            !appUpdater.checking &&
            !appUpdater.downloading &&
            !appUpdater.downloadComplete) {
            appUpdater.checkForUpdates();
        }

        this.updateStatus();
    }

    componentWillUnmount() {
        appUpdater.off('update', this.updateStatus, this);
    }

    updateStatus() {
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
        appUpdater.quitAndInstall();
    }

    downloadUpdate() {
        appUpdater.downloadUpdate();
    }

    render() {
        let spinner,
            installButton,
            downloadButton,
            closeText = 'Close';

        if (appUpdater.checking || appUpdater.downloading || appUpdater.installing) {
            spinner = <Spinner size={30} />;
        }

        if (appUpdater.downloadComplete && !appUpdater.installing) {
            installButton = <Button text="Restart and Install Now" onClick={this.installUpdate}/>;
            closeText = 'Install Later';
        }

        if (appUpdater.hasUpdate && !appUpdater.downloading && !appUpdater.downloadComplete) {
            downloadButton = <Button text="Download Now" onClick={this.downloadUpdate} />;
        }

        return (
            <div className="updates">
                <div className="message">
                    {spinner}
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