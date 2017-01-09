'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Common = require('./core/Common');
const { logger } = require('./core/Global');
const App = require('./ui/components/App.jsx');

module.exports = {
    start: () => {
        logger.log(Common);

        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};