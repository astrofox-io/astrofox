'use strict';

const React = require('react');
const classNames = require('classnames');

const Overlay = (props) => {
    return (
        <div className={classNames({'overlay', 'overlay-active': props.visible})}>
            <div className="background" />
            <div className="content">
                {props.children}
            </div>
        </div>
    );
};

module.exports = Overlay;