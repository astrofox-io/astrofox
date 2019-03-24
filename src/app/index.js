import React from 'react';
import ReactDOM from 'react-dom';
import Application from 'core/Application';
import * as Environment from 'core/Environment';
import App from 'components/App';
import 'styles/index.less';
import 'html/index.html';

// Copy images
require.context('../images/browser/controls', false, /\.(jpg|png|gif)$/);

const app = new Application();
const root = {};

// Development settings
if (process.env.NODE_ENV !== 'production') {
  root.app = app;
  root.env = Environment;
}

// Production settings
if (process.env.NODE_ENV === 'production') {
  // Disable eval
  // eslint-disable-next-line
  window.eval = global.eval = function() {
    throw new Error('eval() not allowed.');
  };
}

ReactDOM.render(<App app={app} />, document.getElementById('app'));

export default root;
