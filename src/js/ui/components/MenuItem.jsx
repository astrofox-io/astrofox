'use strict';

const React = require('react');
const classNames = require('classnames');

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

module.exports = MenuItem;