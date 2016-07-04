'use strict';

const React = require('react');

const ColorInput = (props) => {
    let onChange = (e) => props.onChange(props.name, e.target.value);

    return (
        <div className="input">
            <input type="color"
                className="input-field input-color"
                name={props.name}
                value={props.value}
                onChange={onChange}
            />
        </div>
    );
};

ColorInput.defaultProps = {
    name: "color",
    value: "#ffffff",
    onChange: () => {}
};

module.exports = ColorInput;