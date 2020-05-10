import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import styles from './TextInput.less';

export default function TextInput({
  name = 'text',
  width = 140,
  size = null,
  value = '',
  spellCheck = false,
  autoSelect = false,
  buffered = false,
  readOnly = false,
  disabled = false,
  className,
  onChange,
}) {
  const [bufferedValue, setBufferedValue] = useState(value);
  const input = useRef(null);

  useEffect(() => {
    if (autoSelect) {
      input.current.select();
    }
  }, []);

  useEffect(() => {
    setBufferedValue(value);
  }, [value]);

  function handleChange(e) {
    const { value } = e.currentTarget;

    setBufferedValue(value);

    if (!buffered) {
      onChange(name, value);
    }
  }

  function handleKeyUp(e) {
    if (buffered) {
      // Enter key
      if (e.keyCode === 13) {
        onChange(name, bufferedValue);
      }
      // Esc key
      else if (e.keyCode === 27) {
        onChange(name, value);
      }
    }
  }

  function handleBlur() {
    if (buffered) {
      onChange(name, bufferedValue);
    }
  }

  return (
    <input
      ref={input}
      type="text"
      className={classNames(styles.text, className)}
      style={{ width }}
      name={name}
      size={size}
      spellCheck={spellCheck}
      value={buffered ? bufferedValue : value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
