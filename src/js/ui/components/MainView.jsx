'use strict';

const React = require('react');

const MainView = function(props) {
    return (
        <div className="view">
            {props.children}
        </div>
    );
};

module.exports = MainView;