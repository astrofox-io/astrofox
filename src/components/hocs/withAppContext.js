import React from 'react';
import { AppContext } from 'components/App';

export default function withAppContext(Component) {
  return React.forwardRef((props, ref) => (
    <AppContext.Consumer>{app => <Component {...props} app={app} ref={ref} />}</AppContext.Consumer>
  ));
}
