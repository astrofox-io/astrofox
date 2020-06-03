import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'components/App';
import * as globals from './global';
import getStore from './store';
import 'styles/index.less';
import './fonts.css';
import './index.html';

const store = getStore();

// Development settings
if (process.env.NODE_ENV !== 'production') {
  window._astrofox = globals;
}

// Production settings
if (process.env.NODE_ENV === 'production') {
  // Disable eval
  // eslint-disable-next-line
  window.eval = global.eval = undefined;
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
