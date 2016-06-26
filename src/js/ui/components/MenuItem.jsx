'use strict';

const React = require('react');
const classNames = require('classnames');

const MenuItem = function(props) {
    return (
        <li className={classNames({'menu-item': true, 'checked': props.checked })}
            onClick={props.onClick}>
            {props.label}
        </li>
    );
};

module.exports = MenuItem;