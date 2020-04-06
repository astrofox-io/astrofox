import React from 'react';
import ReactDOM from 'react-dom';
import Application from 'core/Application';
import * as Environment from 'core/Environment';
import App from 'components/App';
import 'styles/fonts.less';
import 'styles/global.less';
import './index.html';

const app = new Application();
const root = {};
export const AppContext = React.createContext();

// Development settings
if (process.env.NODE_ENV !== 'production') {
  root.app = app;
  root.env = Environment;
}

// Production settings
if (process.env.NODE_ENV === 'production') {
  // Disable eval
  // eslint-disable-next-line
  window.eval = global.eval = function () {
    throw new Error('eval() not allowed.');
  };
}

ReactDOM.render(
  <AppContext.Provider value={app}>
    <App app={app} />
  </AppContext.Provider>,
  document.getElementById('app'),
);

export default root;
