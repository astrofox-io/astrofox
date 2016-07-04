'use strict';

const React = require('react');

module.exports = (props) => {
    return (
        <div id="body">
            {props.children}
        </div>
    );
};