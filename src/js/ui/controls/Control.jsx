'use strict';

const React = require('react');

const Control = (props) => {
    return (
        <div className="control">
            <div className="header">{props.title}</div>
            {props.children}
        </div>
    );
};

const Row = (props) => {
    let label = (props.label) ?
        <span className="label">{props.label}</span> : null;

    return (
        <div className="row">
            {label}
            {props.children}
        </div>
    );
};

module.exports = {
    Control,
    Row
};