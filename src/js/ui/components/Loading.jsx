'use strict';

const React = require('react');
const classNames = require('classnames');

const Loading = function(props) {
    return (
        <div className={classNames({ 'loading': true, 'loading-active': props.visible })}></div>
    );
};

Loading.defaultProps = { visible: false };

module.exports = Loading;