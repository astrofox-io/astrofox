import React, { useEffect } from 'react';
import classNames from 'classnames';
import { player } from 'view/global';
import Icon from 'components/interface/Icon';
import { Pause, Play, Stop } from 'view/icons';
import styles from './PlayButtons.less';
import useForceUpdate from '../hooks/useForceUpdate';

export default function PlayButtons() {
  const forceUpdate = useForceUpdate();
  const playing = player.isPlaying();

  useEffect(() => {
    player.on('playback-change', forceUpdate);
  }, []);

  function handlePlayButtonClick() {
    player.play();
  }

  function handleStopButtonClick() {
    player.stop();
  }

  return (
    <div className={styles.buttons}>
      <div
        className={classNames(styles.button, {
          [styles.playButton]: !playing,
          [styles.pauseButton]: playing,
        })}
        onClick={handlePlayButtonClick}
      >
        <Icon
          className={styles.icon}
          glyph={playing ? Pause : Play}
          title={playing ? 'Pause' : 'Play'}
        />
      </div>
      <div className={classNames(styles.button, styles.stopButton)} onClick={handleStopButtonClick}>
        <Icon className={styles.icon} glyph={Stop} title="Stop" />
      </div>
    </div>
  );
}
