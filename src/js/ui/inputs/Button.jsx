import React from 'react';
import classNames from 'classnames';

const Button = (props) => {
    let classes = {
        'input-button': true,
    };

    if (props.icon) {
        classes[props.icon] = true;
    }

    return (
        <span
            className={classNames(classes)}
            title={props.title}
            onClick={props.onClick}>
            {props.text}
        </span>
    );
};

export default Button;