'use strict';

const React = require('react');
const classNames = require('classnames');

const Overlay = function(props) {
    return (
        <div className={classNames({ 'overlay': true, 'overlay-active': props.visible })}>
            <div className="background" />
            <div className="content">
                {props.children}
            </div>
        </div>
    );
};

module.exports = Overlay;