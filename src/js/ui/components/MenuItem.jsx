import React from 'react';
import classNames from 'classnames';

const MenuItem = (props) => {
    let classes = {
        item: true,
        checked: props.checked,
        disabled: props.disabled
    };

    return (
        <div
            className={classNames(classes)}
            onClick={props.onClick}>
            {props.label}
        </div>
    );
};

export default MenuItem;