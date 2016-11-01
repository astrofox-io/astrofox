'use strict';

const React = require('react');
const classNames = require('classnames');

const Dialog = (props) => {
    let icon = (props.icon) ?
        <span className={classNames('icon', props.icon)}/> :
        null;

    return (
        <div className="dialog">
            {icon}
            <span className="message">{props.message}</span>
        </div>
    );
};

module.exports = Dialog;