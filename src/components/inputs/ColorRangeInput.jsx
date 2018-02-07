import React from 'react';
import { ColorInput } from 'lib/inputs';
import styles from './ColorRangeInput.less';

const ColorRangeInput = ({ name, startColor, endColor, onChange }) => (
    <div className={styles.input}>
        <ColorInput
            name="startColor"
            value={startColor}
            onChange={(n, value) => onChange(name, [value, endColor])}
        />
        <div
            className={styles.range}
            style={{
                backgroundImage: `-webkit-linear-gradient(left, ${startColor}, ${endColor})`
            }}
        />
        <ColorInput
            name="endColor"
            value={endColor}
            onChange={(n, value) => onChange(name, [startColor, value])}
        />
    </div>
);

ColorRangeInput.defaultProps = {
    name: 'color',
    startColor: '#ffffff',
    endColor: '#ffffff'
};

export default ColorRangeInput;
