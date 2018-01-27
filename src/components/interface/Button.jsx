import React from 'react';
import classNames from 'classnames';

const Button = (props) => {
    let classes = {
        button: true,
        disabled: props.disabled
    };

    return (
        <span
            className={classNames(classes, props.className)}
            onClick={props.disabled ? null : props.onClick}>
            {props.text}
        </span>
    );
};

export default Button;