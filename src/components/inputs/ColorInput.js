import React from 'react';
import styles from './ColorInput.less';

const ColorInput = ({ name, value, width, onChange }) => (
  <input
    type="color"
    className={styles.input}
    style={{ width }}
    name={name}
    value={value}
    onChange={e => onChange(name, e.target.value)}
  />
);

ColorInput.defaultProps = {
  name: 'color',
  value: '#ffffff',
  width: 40,
  onChange: () => {},
};

export default ColorInput;
