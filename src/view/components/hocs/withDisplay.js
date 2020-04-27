import React from 'react';
import useForceUpdate from 'components/hooks/useForceUpdate';

export default function withDisplay(Component) {
  return function DisplayControlHOC({ display, ...props }) {
    const forceUpdate = useForceUpdate();

    function handleChange(name, value, otherProps) {
      if (display.update({ [name]: value, ...otherProps })) {
        forceUpdate();
      }
    }

    return <Component {...props} display={display} onChange={handleChange} />;
  };
}
