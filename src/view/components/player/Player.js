import React, { useState, useEffect } from 'react';
import shallow from 'zustand/shallow';
import classNames from 'classnames';
import { player } from 'view/global';
import useApp from 'actions/app';
import AudioWaveform from './AudioWaveform';
import Oscilloscope from './Oscilloscope';
import VolumeControl from './VolumeControl';
import ProgressControl from './ProgressControl';
import styles from './Player.less';
import PlayButtons from './PlayButtons';
import ToggleButtons from './ToggleButtons';

export default function Player() {
  const [hasAudio, setHasAudio] = useState(false);
  const [showPlayer, showWaveform, showOsc] = useApp(
    state => [state.showPlayer, state.showWaveform, state.showOsc],
    shallow,
  );

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
