import React from 'react';
import { AppContext } from 'view/index';

export default function withAppContext(Component) {
  return React.forwardRef((props, ref) => (
    <AppContext.Consumer>{app => <Component {...props} app={app} ref={ref} />}</AppContext.Consumer>
  ));
}
