'use strict';

var React = require('react');

var MainView = function(props) {
    return (
        <div className="view">
            {props.children}
        </div>
    );
};

module.exports = MainView;