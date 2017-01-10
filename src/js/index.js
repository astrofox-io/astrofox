'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Common = require('./core/Common');
const { logger } = require('./core/Global');
const App = require('./ui/components/App.jsx');

let Astrofox = {
    start: () => {
        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    }
};

if (process.env.NODE_ENV !== 'production') {
    Astrofox.env = Common;
}

module.exports = Astrofox;