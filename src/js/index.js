import React from 'react';
import ReactDOM from 'react-dom';
import * as Environment from './core/Environment';
import App from './ui/components/App.jsx';

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

export default Astrofox;