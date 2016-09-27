'use strict';

const React = require('react');
const classNames = require('classnames');

const MenuItem = (props) => {
    return (
        <div className={classNames('item', {'checked': props.checked })}
            onClick={props.onClick}>
            {props.label}
        </div>
    );
};

module.exports = MenuItem;