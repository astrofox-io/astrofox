import React from 'react';
import classNames from 'classnames';
import styles from './ToggleInput.less';

const ToggleInput = ({ name, value, onChange }) => (
    <div
        className={
            classNames({
                [styles.toggle]: true,
                [styles.on]: value
            })
        }
        onClick={() => onChange(name, !value)}
    />
);

ToggleInput.defaultProps = {
    name: 'toggle',
    value: false,
    onChange: () => {}
};

export default ToggleInput;