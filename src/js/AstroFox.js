'use strict';

var React = require('react');
var App = require('./ui/App.jsx');
var Browser = require('./Browser.js');

var AstroFox = {
    version: '1.0',

    start: function() {
        Browser.init();

        // Render UI
        React.render(
            React.createElement(App, null),
            document.body
        );
    }
};

module.exports = AstroFox;