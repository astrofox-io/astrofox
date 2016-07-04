'use strict';

const React = require('react');

const MainView = (props) => {
    return (
        <div className="view">
            {props.children}
        </div>
    );
};

module.exports = MainView;