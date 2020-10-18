import React from 'react';
import ReactDOM from 'react-dom';
import App from 'components/App';
import * as globals from './global';
import 'styles/index.less';
import './fonts.css';
import './index.html';

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

ReactDOM.render(<App />, document.getElementById('app'));
