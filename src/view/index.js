import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'components/App';
import * as env from './global';
import getStore from './store';
import 'assets/index.html';
import 'assets/fonts.css';
import 'styles/global.less';

const root = {};
const store = getStore();

// Development settings
if (process.env.NODE_ENV !== 'production') {
  Object.assign(root, env);
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
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);

export default root;
