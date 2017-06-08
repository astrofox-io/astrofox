import React from 'react';
import classNames from 'classnames';

const ButtonInput = (props) => {
    let icon = null,
        classes = {
            'input-button': true,
            'input-button-disabled': props.disabled
        };

    if (props.icon) {
        icon = <span className={props.icon} />;
    }

    return (
        <span
            className={classNames(classes, props.className)}
            title={props.title}
            onClick={props.disabled ? null : props.onClick}>
            {icon}
            {props.text}
        </span>
    );
};

export default ButtonInput;