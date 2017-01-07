'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Common = require('./core/Common');
const { logger } = require('./core/Global');
const App = require('./ui/components/App.jsx');

const AstroFox = {
    start: () => {
        logger.log(Common);

        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};

module.exports = AstroFox;