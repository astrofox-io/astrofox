'use strict';

var ReactDOM = require('react-dom');
var App = require('./ui/App.jsx');
var Window = require('./Window.js');
var redux = require('redux');
var Provider = require('react-redux').Provider;

var settings = function(state, action) {
    console.log(state, action);
    return state;
};

var store = redux.createStore(function(state, action) {
    return {
        settings: settings(state, action)
    };
});

var AstroFox = {
    version: '1.0',
    environment: 'dev',
    license: null,

    start: function() {
        Window.init();

        // Render UI
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;