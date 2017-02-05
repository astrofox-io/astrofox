import React from 'react';
import classNames from 'classnames';

const Button = (props) => {
    let classes = {
        'button': true,
    };

    if (props.icon) {
        classes[props.icon] = true;
    }

    return (
        <span
            className={classNames(classes, props.className)}
            title={props.title}
            onClick={props.onClick}>
            {props.text}
        </span>
    );
};

export default Button;