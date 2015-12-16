'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var App = require('./ui/App.jsx');
var Window = require('./Window.js');

var AstroFox = {
    version: '1.0',
    environment: 'dev',
    license: null,

    start: function() {
        Window.init();

        // Render UI
        ReactDOM.render(
            React.createElement(App, null),
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;