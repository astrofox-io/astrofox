import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { player } from 'view/global';
import AudioWaveform from './AudioWaveform';
import Oscilloscope from './Oscilloscope';
import VolumeControl from './VolumeControl';
import ProgressControl from './ProgressControl';
import styles from './Player.less';
import PlayButtons from './PlayButtons';
import ToggleButtons from './ToggleButtons';

export default function Player() {
  const [hasAudio, setHasAudio] = useState(false);
  const showPlayer = useSelector(state => state.app.showPlayer);
  const showWaveform = useSelector(state => state.app.showWaveform);
  const showOsc = useSelector(state => state.app.showOsc);

  function handleAudioLoad() {
    setHasAudio(player.hasAudio());
  }

  useEffect(() => {
    player.on('audio-load', handleAudioLoad);

    return () => {
      player.off('audio-load', handleAudioLoad);
    };
  }, []);

  return (
    <div className={classNames({ [styles.hidden]: !showPlayer })}>
      <AudioWaveform visible={hasAudio && showWaveform} />
      <div className={styles.player}>
        <PlayButtons />
        <VolumeControl />
        <ProgressControl />
        <ToggleButtons />
      </div>
      {showOsc && <Oscilloscope />}
    </div>
  );
}
