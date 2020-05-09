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
  const [savedValue, setSavedValue] = useState(value);
  const input = useRef();

  useEffect(() => {
    if (autoSelect) {
      input.current.select();
    }
  }, []);

  function handleChange(e) {
    const { value } = e.currentTarget;

    setSavedValue(value);

    if (!buffered) {
      onChange(name, value);
    }
  }

  function handleKeyUp(e) {
    if (buffered) {
      // Enter key
      if (e.keyCode === 13) {
        onChange(name, savedValue);
      }
      // Esc key
      else if (e.keyCode === 27) {
        onChange(name, value);
      }
    }
  }

  function handleBlur() {
    if (buffered) {
      onChange(name, savedValue);
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
      value={savedValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
