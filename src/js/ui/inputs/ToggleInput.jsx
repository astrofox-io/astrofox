import React from 'react';
import classNames from 'classnames';

const ToggleInput = (props) => {
    let classes = {
        'input': true,
        'input-toggle': true,
        'input-toggle-on': props.value
    };

    let onClick = () => props.onChange(props.name, !props.value);

    return (
        <div className={classNames(classes)} onClick={onClick} />
    );
};

ToggleInput.defaultProps = {
    name: 'toggle',
    value: false,
    onChange: () => {}
};

export default ToggleInput;