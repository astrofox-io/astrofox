import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import useForceUpdate from 'components/hooks/useForceUpdate';
import { player } from 'view/global';
import { Cycle, SoundBars, SoundWaves } from 'view/icons';
import { toggleState } from 'actions/app';
import styles from './ToggleButtons.less';

export default function ToggleButtons() {
  const dispatch = useDispatch();
  const showWaveform = useSelector(state => state.app.showWaveform);
  const showOsc = useSelector(state => state.app.showOsc);
  const forceUpdate = useForceUpdate();
  const looping = player.isLooping();

  function handleLoopButtonClick() {
    player.setLoop(!looping);
    forceUpdate();
  }

  return (
    <div className={styles.buttons}>
      <ToggleButton icon={Cycle} title="Repeat" enabled={looping} onClick={handleLoopButtonClick} />
      <ToggleButton
        icon={SoundBars}
        title="Waveform"
        enabled={showWaveform}
        onClick={() => dispatch(toggleState('showWaveform'))}
      />
      <ToggleButton
        icon={SoundWaves}
        title="Oscilloscope"
        enabled={showOsc}
        onClick={() => dispatch(toggleState('showOsc'))}
      />
    </div>
  );
}

const ToggleButton = ({ enabled, title, icon, onClick }) => (
  <div
    className={classNames({
      [styles.button]: true,
      [styles.enabled]: enabled,
    })}
    onClick={onClick}
  >
    <Icon className={styles.icon} glyph={icon} title={title} width={20} height={20} />
  </div>
);
