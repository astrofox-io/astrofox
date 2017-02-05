import React from 'react';

const ColorInput = (props) => {
    let onChange = (e) => {
        if (props.onChange) {
            props.onChange(props.name, e.target.value);
        }
    };

    return (
        <div className="input">
            <input
                type="color"
                className="input-field input-color"
                style={{width: props.width}}
                name={props.name}
                value={props.value}
                onChange={onChange}
            />
        </div>
    );
};

ColorInput.defaultProps = {
    name: 'color',
    value: '#ffffff',
    width: 40,
    onChange: null
};

export default ColorInput;