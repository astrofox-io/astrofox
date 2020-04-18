import React, { useState, useEffect } from 'react';
import { updater } from 'view/global';
import Button from 'components/interface/Button';
import Checkmark from 'components/interface/Checkmark';
import Spinner from 'components/interface/Spinner';
import styles from './AppUpdates.less';

export default function AppUpdates({ onClose }) {
  const [status, setStatus] = useState();
  const {
    checking,
    checked,
    error,
    installing,
    downloading,
    downloadComplete,
    hasUpdate,
  } = updater;

  let installButton;
  let downloadButton;
  let closeText = 'Close';

  useEffect(() => {
    updater.on('status', setStatus, this);

    if (!checking && !downloading && !downloadComplete && !installing) {
      // Let css animation complete
      setTimeout(() => {
        updater.checkForUpdates();
      }, 1000);
    }

    return () => {
      updater.off('status', setStatus, this);
    };
  });

  function installUpdate() {
    updater.quitAndInstall();
  }

  function downloadUpdate() {
    updater.downloadUpdate();
  }

  function getMessage() {
    const {
      info: { version },
    } = updater;

    let message = 'Checking for updates...';

    if (error) {
      message = 'An error has occured. Unable to check for updates.';
    } else if (downloading) {
      message = 'Downloading update...';
    } else if (installing) {
      message = 'Installing update...';
    } else if (downloadComplete) {
      message = `A new update (${version}) is ready to install.`;
    } else if (hasUpdate) {
      message = `A new update (${version}) is available to download and install.`;
    } else if (checked) {
      message = 'You have the latest version.';
    }

    return message;
  }

  function getIcon() {
    return status && checked && !hasUpdate ? (
      <Checkmark className={styles.icon} size={30} />
    ) : (
      <Spinner className={styles.icon} size={30} />
    );
  }

  if (downloadComplete && !installing) {
    installButton = <Button text="Restart and Install Now" onClick={installUpdate} />;
    closeText = 'Install Later';
  }

  if (hasUpdate && !downloading && !downloadComplete) {
    downloadButton = <Button text="Download Now" onClick={downloadUpdate} />;
  }

  return (
    <>
      <div className={styles.message}>
        {getIcon()}
        {getMessage()}
      </div>
      <div className={styles.buttons}>
        {installButton}
        {downloadButton}
        <Button className={styles.button} text={closeText} onClick={onClose} />
      </div>
    </>
  );
}
