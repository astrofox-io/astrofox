'use strict';

const React = require('react');
const classNames = require('classnames');

const ToggleInput = function(props) {
    let classes = {
        'input': true,
        'input-toggle': true,
        'input-toggle-on': props.value
    };

    let onClick = (e) => props.onChange(props.name, !props.value);

    return (
        <div className={classNames(classes)} onClick={onClick} />
    );
};

ToggleInput.defaultProps = {
    name: 'toggle',
    value: false,
    onChange: () => {}
};

module.exports = ToggleInput;