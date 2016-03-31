'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Redux = require('redux');
var Provider = require('react-redux').Provider;

var App = require('./ui/App.jsx');
var Window = require('./Window.js');

var settings = function(state, action) {
    console.log(state, action);
    return state;
};

var store = Redux.createStore(function(state, action) {
    return {
        settings: settings(state, action)
    };
});

var AstroFox = {
    version: '1.0',
    environment: 'dev',
    license: null,

    start: function() {
        console.log(process.versions);

        Window.init();

        ReactDOM.render(
            React.createElement(
                Provider,
                { store: store },
                React.createElement(App, null)
            ),
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;