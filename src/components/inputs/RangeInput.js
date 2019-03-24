/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import classNames from 'classnames';
import { val2pct } from 'utils/math';
import styles from './RangeInput.less';

export default class RangeInput extends Component {
  static defaultProps = {
    name: 'range',
    min: 0,
    max: 1,
    value: 0,
    step: 1,
    lowerLimit: false,
    upperLimit: false,
    buffered: false,
    disabled: false,
    fillStyle: 'left',
    showTrack: true,
    onChange: () => {},
    onUpdate: () => {},
  };

  state = {
    value: this.props.value,
    initialValue: this.props.value,
    updating: false,
  };

  static getDerivedStateFromProps({ value, buffered }, { initialValue, updating }) {
    if (!(buffered && updating) && value !== initialValue) {
      return { value, initialValue: value };
    }
    return null;
  }

  handleChange = e => {
    const { name, buffered, onChange, onUpdate, upperLimit, lowerLimit } = this.props;

    let value = +e.currentTarget.value;

    if (lowerLimit !== false && value < lowerLimit) {
      value = lowerLimit;
    } else if (upperLimit !== false && value > upperLimit) {
      value = upperLimit;
    }

    this.setState({ value }, () => {
      if (buffered) {
        onUpdate(name, value);
      } else {
        onChange(name, value);
      }
    });
  };

  handleMouseDown = () => this.setState({ updating: true });

  handleMouseUp = () => {
    const { name, buffered, onChange } = this.props;
    const { value } = this.state;

    this.setState({ updating: false }, () => {
      if (buffered) {
        onChange(name, value);
      }
    });
  };

  getFillStyle() {
    const { min, max, fillStyle } = this.props;
    const { value } = this.state;
    const pct = val2pct(value, min, max) * 100;

    switch (fillStyle) {
      case 'left':
        return { width: `${pct}%` };
      case 'right':
        return { width: `${100 - pct}%`, marginLeft: `${pct}%` };
      default:
        return { display: 'none' };
    }
  }

  render() {
    const { name, min, max, step, disabled, showTrack } = this.props;

    const { value } = this.state;

    return (
      <div className={styles.range}>
        <div
          className={classNames({
            [styles.track]: true,
            [styles.hidden]: !showTrack,
          })}
        />
        <div className={styles.fill} style={this.getFillStyle()} />
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={this.handleChange}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          disabled={disabled}
        />
      </div>
    );
  }
}
