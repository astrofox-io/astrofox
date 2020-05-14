import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { val2pct } from 'utils/math';
import styles from './RangeInput.less';

export default function RangeInput({
  name = 'range',
  value = 0,
  min = 0,
  max = 1,
  step = 1,
  lowerLimit = false,
  upperLimit = false,
  buffered = false,
  disabled = false,
  fillStyle = 'left',
  showTrack = true,
  className,
  onChange = () => {},
  onUpdate = () => {},
}) {
  const [bufferedValue, setBufferedValue] = useState(value);
  const buffering = useRef(false);

  useEffect(() => {
    if (!buffering.current) {
      setBufferedValue(value);
    }
  }, [value]);

  function handleChange(e) {
    let newValue = +e.currentTarget.value;

    if (lowerLimit !== false && newValue < lowerLimit) {
      newValue = lowerLimit;
    } else if (upperLimit !== false && newValue > upperLimit) {
      newValue = upperLimit;
    }

    if (buffered) {
      setBufferedValue(newValue);
      onUpdate(name, newValue);
    } else {
      onChange(name, newValue);
    }
  }

  function handleMouseDown() {
    buffering.current = true;
  }

  function handleMouseUp() {
    buffering.current = false;

    if (buffered) {
      onChange(name, bufferedValue);
    }
  }

  function getFillStyle() {
    const pct = val2pct(buffered ? bufferedValue : value, min, max) * 100;

    switch (fillStyle) {
      case 'left':
        return { width: `${pct}%` };
      case 'right':
        return { width: `${100 - pct}%`, marginLeft: `${pct}%` };
      default:
        return { display: 'none' };
    }
  }

  return (
    <div className={classNames(styles.range, className)}>
      <div
        className={classNames(styles.track, {
          [styles.hidden]: !showTrack,
        })}
      />
      <div className={styles.fill} style={getFillStyle()} />
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={buffered ? bufferedValue : value}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        disabled={disabled}
      />
    </div>
  );
}
