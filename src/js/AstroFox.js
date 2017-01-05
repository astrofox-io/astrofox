'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const { logger, APP_NAME, APP_VERSION } = require('./core/Global');
const App = require('./ui/components/App.jsx');

const AstroFox = {
    version: APP_VERSION,

    start: () => {
        logger.log(APP_NAME, 'version', APP_VERSION, __dirname);

        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;