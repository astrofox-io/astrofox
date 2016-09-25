'use strict';

const React = require('react');
const classNames = require('classnames');

const Settings = (props) => {
    return (
        <div className={classNames('settings', props.className)}>
            {props.children}
        </div>
    );
};

const Group = (props) => {
    return (
        <div className={classNames('group', props.className)}>
            <div className="name">{props.name}</div>
            {props.children}
        </div>
    );
};

const Row = (props) => {
    let label = (props.label) ?
        <span className="label">{props.label}</span> : null;

    return (
        <div className={classNames('row', props.className)}>
            {label}
            {props.children}
        </div>
    );
};

module.exports = {
    Settings,
    Group,
    Row
};