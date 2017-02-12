import React from 'react';

import UIComponent from '../UIComponent';
import { appUpdater } from '../../core/Global';
import Button from  '../components/Button';
import Spinner from '../components/Spinner';

export default class Updater extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            message: null
        };
    }

    componentDidMount() {
        appUpdater.on('check-for-updates-complete', this.onCheckComplete, this);
        appUpdater.on('update-error', this.onCheckComplete, this);
        appUpdater.on('update-downloaded', this.onCheckComplete, this);

        if (!appUpdater.checking && !appUpdater.downloading && !appUpdater.downloadComplete) {
            this.setState({ message: 'Checking for updates...'});

            appUpdater.checkForUpdates();
        }
        else {
            this.onCheckComplete();
        }
    }

    componentWillUnmount() {
        appUpdater.off('check-for-updates-complete', this.onCheckComplete, this);
        appUpdater.off('update-error', this.onCheckComplete, this);
        appUpdater.off('update-downloaded', this.onCheckComplete, this);
    }

    onCheckComplete(error) {
        if (error) {
            this.setState({ message: 'Unable to check for updates.' });
            return;
        }

        if (appUpdater.downloading) {
            this.setState({ message: 'Downloading update...' });
        }
        else if (appUpdater.downloadComplete) {
            let version = appUpdater.versionInfo.version;
            this.setState({ message: `A new update (${version}) is ready to install.` });
        }
        else {
            this.setState({ message: 'You have the latest version.' });
        }
    }

    installUpdate() {
        appUpdater.quitAndInstall();
    }

    render() {
        let spinner,
            installButton,
            closeText = 'Close';

        if (appUpdater.checking || appUpdater.downloading) {
            spinner = <Spinner size={30} />;
        }

        if (appUpdater.downloadComplete) {
            installButton = <Button text="Restart and Install" onClick={this.installUpdate}/>;
            closeText = 'Install Later';
        }

        return (
            <div className="updates">
                <div className="message">
                    {spinner}
                    {this.state.message}
                </div>
                <div className="buttons">
                    {installButton}
                    <Button text={closeText} onClick={this.props.onClose} />
                </div>
            </div>
        );
    }
}