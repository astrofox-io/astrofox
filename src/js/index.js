'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Environment = require('./core/Environment');
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
    Astrofox.env = Environment;
}

module.exports = Astrofox;