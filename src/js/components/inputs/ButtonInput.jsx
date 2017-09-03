import React from 'react';
import classNames from 'classnames';

const ButtonInput = (props) => {
    let icon = null,
        text = null,
        classes = {
            'input-button': true,
            'input-button-active': props.active,
            'input-button-disabled': props.disabled
        };

    if (props.icon) {
        icon = <span className={props.icon} />;
    }

    if (props.text) {
        text = <span className="icon-button-text">{props.text}</span>;
    }

    return (
        <div
            className={classNames(classes, props.className)}
            title={props.title}
            onClick={props.disabled ? null : props.onClick}>
            {icon}
            {text}
        </div>
    );
};

export default ButtonInput;