'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const { logger } = require('./core/Global');
const App = require('./ui/components/App.jsx');

const AstroFox = {
    version: '0.1',

    start: () => {
        logger.log(process.versions);

        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;