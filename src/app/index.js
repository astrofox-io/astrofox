import React from 'react';
import ReactDOM from 'react-dom';
import Application from 'core/Application';
import * as Environment from 'core/Environment';
import App from 'components/App';

require('../styles/index.less');
require('../html/index.html');

require.context('../images/browser/controls', false, /\.(jpg|png|gif)$/);

const app = new Application();
const root = {};

if (process.env.NODE_ENV !== 'production') {
    root.app = app;
    root.env = Environment;
}

ReactDOM.render(
    <App app={app} />,
    document.getElementById('app'),
);

export default root;
