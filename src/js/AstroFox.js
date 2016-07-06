'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Logger = require('./core/Logger.js');
const App = require('./ui/App.jsx');

const AstroFox = {
    version: '0.1',

    start: () => {
        Logger.log(process.versions);

        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;