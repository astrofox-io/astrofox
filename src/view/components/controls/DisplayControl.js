import React from 'react';
import useForceUpdate from 'components/hooks/useForceUpdate';

export default function DisplayControl(ControlComponent) {
  return function DisplayControlHOC({ display, ...props }) {
    const forceUpdate = useForceUpdate();

    function handleChange(name, value, otherProps) {
      if (display.update({ [name]: value, ...otherProps })) {
        forceUpdate();
      }
    }

    return <ControlComponent {...props} {...display.properties} onChange={handleChange} />;
  };
}
