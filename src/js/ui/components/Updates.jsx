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
        appUpdater.on('update', this.onCheckComplete, this);

        if (!appUpdater.checking && !appUpdater.downloading && !appUpdater.downloadComplete) {
            this.setState({ message: 'Checking for updates...'});

            appUpdater.checkForUpdates();
        }
        else {
            this.onCheckComplete();
        }
    }

    componentWillUnmount() {
        appUpdater.off('update', this.onCheckComplete, this);
    }

    onCheckComplete() {
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

        if (appUpdater.checking || appUpdater.downloading || appUpdater.installing) {
            spinner = <Spinner size={30} />;
        }

        if (appUpdater.downloadComplete && !appUpdater.installing) {
            installButton = <Button text="Restart and Install Now" onClick={this.installUpdate}/>;
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