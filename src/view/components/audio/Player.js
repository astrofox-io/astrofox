import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import useMergeState from 'components/hooks/useMergeState';
import Icon from 'components/interface/Icon';
import { RangeInput } from 'components/inputs';
import { events, player } from 'view/global';
import { formatTime } from 'utils/format';
import { Play, Pause, Stop, SoundBars, SoundWaves, Cycle } from 'view/icons';
import AudioWaveform from './AudioWaveform';
import Oscilloscope from './Oscilloscope';
import VolumeControl from './VolumeControl';
import styles from './Player.less';


const PROGRESS_MAX = 1000;
const defaultState = {
  playing: false,
  looping: false,
  progressPosition: 0,
  progressBuffering: false,
  seekPosition: 0,
  duration: 0,
  showWaveform: true,
  showOsc: false,
};

export default function Player() {
  const [state, setState] = useMergeState(defaultState);
  const showPlayer = useSelector(state => state.app.showPlayer);
  const {
    playing,
    duration,
    progressPosition,
    seekPosition,
    looping,
    showWaveform,
    showOsc,
    progressBuffering,
  } = state;
  const waveform = useRef();
  const oscilloscope = useRef();

  function handlePlayButtonClick() {
    player.play();
  }

  function handleStopButtonClick() {
    player.stop();
  }

  function handleLoopButtonClick() {
    setState(state => {
      player.setLoop(!state.looping);
      return { looping: player.isLooping() };
    });
  }

  function handleWaveformClick(pos) {
    player.seek(pos);
  }

  function handleWaveformSeek(pos) {
    setState({ seekPosition: pos });
  }

  function handleWaveformButtonClick() {
    setState(state => ({ showWaveform: !state.showWaveform }));
  }

  function handleOscButtonClick() {
    setState(state => ({ showOsc: !state.showOsc }));
  }

  function handleVolumeChange(value) {
    player.setVolume(value);
  }

  function handleProgressChange(pos) {
    player.seek(pos);
    setState({ progressPosition: player.getPosition(), seekPosition: 0, progressBuffering: false });
  }

  function handleProgressUpdate(pos) {
    setState({ seekPosition: pos, progressBuffering: true });
  }

  function handleAudioLoad() {
    setState({ duration: player.getDuration() });

    waveform.current.loadAudio(player.getAudio());
  }

  function handlePlayerPlay() {
    setState({ playing: player.isPlaying() });
  }

  function handlePlayerStop() {
    setState({ playing: player.isPlaying(), progressPosition: 0, seekPosition: 0 });
  }

  function handlePlayerUpdate() {
    if (player.isPlaying() && !progressBuffering) {
      setState({ progressPosition: player.getPosition() });
    }
  }

  function handlePlayerSeek() {
    const pos = player.getPosition();

    setState({ progressPosition: pos, seekPosition: pos });
  }

  function draw(data) {
    if (oscilloscope.current) {
      oscilloscope.current.draw(data);
    }
  }

  useEffect(() => {
    player.on('play', handlePlayerPlay);
    player.on('pause', handlePlayerPlay);
    player.on('stop', handlePlayerStop);
    player.on('load', handleAudioLoad);
    player.on('tick', handlePlayerUpdate);
    player.on('seek', handlePlayerSeek);
    events.on('render', draw);
  }, []);

  return (
    <div className={classNames({ [styles.hidden]: !showPlayer })}>
      <AudioWaveform
        forwardedRef={waveform}
        progressPosition={progressPosition}
        seekPosition={seekPosition}
        visible={showWaveform && duration}
        onClick={handleWaveformClick}
        onSeek={handleWaveformSeek}
      />
      <div className={styles.player}>
        <div className={styles.buttons}>
          <PlayButton playing={playing} onClick={handlePlayButtonClick} />
          <StopButton onClick={handleStopButtonClick} />
        </div>
        <VolumeControl onChange={handleVolumeChange} />
        <ProgressControl
          value={progressPosition * PROGRESS_MAX}
          onChange={handleProgressChange}
          onUpdate={handleProgressUpdate}
          disabled={!duration}
        />
        <TimeInfo
          currentTime={duration * (seekPosition || progressPosition)}
          totalTime={duration}
        />
        <ToggleButton
          icon={Cycle}
          title="Repeat"
          active={looping}
          onClick={handleLoopButtonClick}
        />
        <ToggleButton
          icon={SoundBars}
          title="Waveform"
          active={showWaveform}
          onClick={handleWaveformButtonClick}
        />
        <ToggleButton
          icon={SoundWaves}
          title="Oscilloscope"
          active={showOsc}
          onClick={handleOscButtonClick}
        />
      </div>
      {showOsc && <Oscilloscope forwardedRef={oscilloscope} />}
    </div>
  );
}

const ProgressControl = ({ value, disabled, onChange, onUpdate }) => (
  <div className={styles.progress}>
    <RangeInput
      name="progress"
      min={0}
      max={PROGRESS_MAX}
      value={value}
      buffered
      onChange={(name, newValue) => onChange(newValue / PROGRESS_MAX)}
      onUpdate={(name, newValue) => onUpdate(newValue / PROGRESS_MAX)}
      disabled={disabled}
    />
  </div>
);

const PlayButton = ({ playing, title, onClick }) => (
  <div
    role="presentation"
    className={classNames({
      [styles.button]: true,
      [styles.playButton]: !playing,
      [styles.pauseButton]: playing,
    })}
    onClick={onClick}
  >
    <Icon className={styles.icon} glyph={playing ? Pause : Play} title={title} />
  </div>
);

const StopButton = ({ title, onClick }) => (
  <div
    role="presentation"
    className={classNames(styles.button, styles.stopButton)}
    onClick={onClick}
  >
    <Icon className={styles.icon} glyph={Stop} title={title} />
  </div>
);

const ToggleButton = ({ active, title, icon, onClick }) => (
  <div
    role="presentation"
    className={classNames({
      [styles.toggleButton]: true,
      [styles.toggleButtonActive]: active,
    })}
    onClick={onClick}
  >
    <Icon className={styles.icon} glyph={icon} title={title} width={20} height={20} />
  </div>
);

const TimeInfo = ({ currentTime, totalTime }) => (
  <div className={styles.timeInfo}>
    <span className={classNames(styles.timePart, styles.currentTime)}>
      {formatTime(currentTime)}
    </span>
    <span className={classNames(styles.timePart, styles.timeSplit)} />
    <span className={classNames(styles.timePart, styles.totalTime)}>{formatTime(totalTime)}</span>
  </div>
);
