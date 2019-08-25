import React, { PureComponent } from 'react';
import { RangeInput } from 'lib/inputs';
import Icon from 'components/interface/Icon';
import iconVolume1 from 'svg/icons/volume.svg';
import iconVolume2 from 'svg/icons/volume2.svg';
import iconVolume3 from 'svg/icons/volume3.svg';
import iconVolume4 from 'svg/icons/volume4.svg';
import styles from './VolumeControl.less';

export default class VolumeControl extends PureComponent {
  state = {
    value: 100,
    mute: false,
  };

  handleChange = (name, value) => {
    this.props.onChange(value / 100);

    this.setState({ value, mute: false });
  };

  handleClick = () => {
    this.setState((prevState, props) => {
      props.onChange(prevState.mute ? prevState.value / 100 : 0);

      return { mute: !prevState.mute };
    });
  };

  render() {
    const { value, mute } = this.state;
    let icon;

    if (value < 10 || mute) {
      icon = iconVolume4;
    } else if (value < 25) {
      icon = iconVolume3;
    } else if (value < 75) {
      icon = iconVolume2;
    } else {
      icon = iconVolume1;
    }

    return (
      <div className={styles.volume}>
        <div role="presentation" className={styles.speaker} onClick={this.handleClick}>
          <Icon className={styles.icon} glyph={icon} />
        </div>
        <div className={styles.slider}>
          <RangeInput
            name="volume"
            min={0}
            max={100}
            value={mute ? 0 : value}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}
