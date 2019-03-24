import React, { PureComponent } from 'react';
import TextInput from 'components/inputs/TextInput';
import { formatSeekTime, parseSeekTime } from 'utils/format';
import { clamp } from 'utils/math.js';

export default class TimeInput extends PureComponent {
  static defaultProps = {
    name: 'time',
    width: 140,
    size: null,
    value: 0,
    readOnly: false,
    disabled: false,
    onChange: () => {},
  };

  state = {
    key: 0,
  };

  handleChange = (name, value) => {
    const { min, max, onChange } = this.props;

    let time = parseSeekTime(value);

    if (time !== null) {
      // Clamp to min/max
      if (min !== false && max !== false) {
        time = clamp(time, min, max);
      }

      onChange(name, time);
    }
    // Reset to previous value
    else {
      this.setState(({ key }) => ({ key: key + 1 }));
    }
  };

  render() {
    const { name, value, width, size, readOnly, disabled } = this.props;

    const { key } = this.state;

    return (
      <TextInput
        key={key}
        name={name}
        width={width}
        size={size}
        buffered
        readOnly={readOnly}
        disabled={disabled}
        value={formatSeekTime(value)}
        onChange={this.handleChange}
      />
    );
  }
}
