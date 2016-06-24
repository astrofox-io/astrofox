'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Redux = require('redux');
const Provider = require('react-redux').Provider;
const Window = require('./Window.js');
const AppState = require('./reducers/AppState.js');
const App = require('./ui/App.jsx');

const store = Redux.createStore(AppState);

const AstroFox = {
    version: '0.1',

    start: function() {
        console.log(process.versions);

        Window.init();

        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;