import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

function LEDControl({ display, active, onChange }) {
  const { spacing, size, blur } = display.properties;

  return (
    <Control label="LED" active={active} display={display} onChange={onChange}>
      <Option
        label="Spacing"
        type="number"
        name="spacing"
        value={spacing}
        min={1}
        max={100}
        withRange
      />
      <Option label="Size" type="number" name="size" value={size} min={0} max={100} withRange />
      <Option label="Blur" type="number" name="blur" value={blur} min={0} max={100} withRange />
    </Control>
  );
}

export default withDisplay(LEDControl);
