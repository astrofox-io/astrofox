import React from 'react';
import ReactDOM from 'react-dom';
import * as Environment from './core/Environment';
import App from './ui/components/App';

export function start() {
    ReactDOM.render(
        <App />,
        document.getElementById('app')
    );
}

export let env = {};

if (!__PROD__) {
    env = Environment;
}
