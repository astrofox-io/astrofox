'use strict';

const React = require('react');
const classNames = require('classnames');

const Control = (props) => {
    return (
        <div className={classNames('control', props.className)}>
            <div className="header">
                <span className="label">{props.label}</span>
            </div>
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
    Control,
    Row
};