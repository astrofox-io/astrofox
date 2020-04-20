import React, { useState } from 'react';
import { RangeInput } from 'components/inputs';
import Icon from 'components/interface/Icon';
import { Volume, Volume2, Volume3, Volume4 } from 'view/icons';
import styles from './VolumeControl.less';

const defaultState = {
  value: 100,
  mute: false,
};

export default function VolumeControl({ onChange }) {
  const [state, setState] = useState(defaultState);
  const { value, mute } = state;

  function handleChange(name, value) {
    setState({ value, mute: false });
    onChange(value / 100);
  }

  function handleClick() {
    setState(prevState => {
      onChange(prevState.mute ? prevState.value / 100 : 0);

      return { ...prevState, mute: !prevState.mute };
    });
  }

  function getIcon() {
    let icon = null;

    if (value < 10 || mute) {
      icon = Volume4;
    } else if (value < 25) {
      icon = Volume3;
    } else if (value < 75) {
      icon = Volume2;
    } else {
      icon = Volume;
    }

    return icon;
  }

  return (
    <div className={styles.volume}>
      <div role="presentation" className={styles.speaker} onClick={handleClick}>
        <Icon className={styles.icon} glyph={getIcon()} />
      </div>
      <div className={styles.slider}>
        <RangeInput
          name="volume"
          min={0}
          max={100}
          value={mute ? 0 : value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
