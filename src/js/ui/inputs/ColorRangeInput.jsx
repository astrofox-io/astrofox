'use strict';

const React = require('react');

const ColorInput = require('./ColorInput.jsx');

const ColorRangeInput = (props) => {
    let colorRangeStyle = {
        backgroundImage: '-webkit-linear-gradient(left, '+props.startColor+','+props.endColor+')'
    };

    let onChange = (name, val) => {
        props.onChange(props.name, (name === 'startColor') ? [val, props.endColor] : [props.startColor, val]);
    };

    return (
        <div className="input-color-range flex">
            <ColorInput
                name="startColor"
                value={props.startColor}
                onChange={onChange}
            />
            <div className="input color-range flex" style={colorRangeStyle} />
            <ColorInput
                name="endColor"
                value={props.endColor}
                onChange={onChange}
            />
        </div>
    );
};

ColorRangeInput.defaultProps = {
    name: 'color',
    startColor: '#ffffff',
    endColor: '#ffffff'
};

module.exports = ColorRangeInput;
