import React, { useEffect } from 'react';
import { Button, Icon, Spinner, Checkmark } from 'components/interface';
import { Warning } from 'view/icons';
import useUpdates, {
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  resetUpdates,
} from 'actions/updates';
import styles from './AppUpdates.less';

export default function AppUpdates({ onClose }) {
  const { status, checked, hasUpdate, downloadComplete, downloadProgress, updateInfo } = useUpdates(
    state => state,
  );

  function handleInstall() {
    quitAndInstall();
  }

  function handleDownload() {
    downloadUpdate();
  }

  function getMessage() {
    if (status === 'error') {
      return 'An error has occured. Unable to check for updates.';
    } else if (status === 'downloading') {
      return `Downloading update... ${~~downloadProgress}%`;
    } else if (downloadComplete) {
      return `A new update (${updateInfo.version}) is ready to install.`;
    } else if (hasUpdate) {
      return `A new update (${updateInfo.version}) is available to download and install.`;
    } else if (checked) {
      return 'You have the latest version.';
    }
    return 'Checking for updates...';
  }

  function getIcon() {
    if (status === 'error') {
      return <Icon className={styles.icon} glyph={Warning} />;
    } else if (checked && status === null) {
      return <Checkmark className={styles.icon} size={30} />;
    }

    return <Spinner className={styles.icon} size={30} />;
  }

  useEffect(() => {
    if (!checked) {
      setTimeout(() => checkForUpdates, 1000);
    }

    return () => {
      resetUpdates();
    };
  }, []);

  return (
    <>
      <div className={styles.message}>
        {getIcon()}
        {getMessage()}
      </div>
      <div className={styles.buttons}>
        {hasUpdate && !downloadComplete && status !== 'downloading' && (
          <Button text="Download update" onClick={handleDownload} />
        )}
        {downloadComplete && <Button text="Restart and install update" onClick={handleInstall} />}
        <Button
          className={styles.button}
          text={downloadComplete ? 'Restart later' : 'Close'}
          onClick={onClose}
        />
      </div>
    </>
  );
}
