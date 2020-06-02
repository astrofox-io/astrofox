import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Spinner, Checkmark } from 'components/interface';
import { Warning } from 'view/icons';
import { checkForUpdates, downloadUpdate, quitAndInstall } from 'actions/updates';
import styles from './AppUpdates.less';

export default function AppUpdates({ onClose }) {
  const dispatch = useDispatch();
  const updates = useSelector(state => state.updates);
  const {
    status,
    checked,
    hasUpdate,
    downloadComplete,
    downloadProgress,
    error,
    updateInfo,
  } = updates;

  function handleInstall() {
    dispatch(quitAndInstall());
  }

  function handleDownload() {
    dispatch(downloadUpdate());
  }

  function getMessage() {
    if (error) {
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
    if (error) {
      return <Icon className={styles.icon} glyph={Warning} />;
    } else if (checked && status === null) {
      return <Checkmark className={styles.icon} size={30} />;
    }

    return <Spinner className={styles.icon} size={30} />;
  }

  useEffect(() => {
    if (!checked) {
      setTimeout(() => dispatch(checkForUpdates()), 1000);
    }
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
