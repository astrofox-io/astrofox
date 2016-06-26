'use strict';

const React = require('react');

module.exports = function(props) {
    return (
        <div id="body">
            {props.children}
        </div>
    );
};