'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Redux = require('redux');
var Provider = require('react-redux').Provider;
var Window = require('./Window.js');
var AppState = require('./reducers/AppState.js');
var App = require('./ui/App.jsx');

var store = Redux.createStore(AppState);

var AstroFox = {
    version: '0.1',

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