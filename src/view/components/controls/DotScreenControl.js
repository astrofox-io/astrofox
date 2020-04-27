import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

function DotScreenControl({ display, active, onChange }) {
  const { scale, angle } = display.properties;

  return (
    <Control label="Dot Screen" active={active} display={display} onChange={onChange}>
      <Option
        label="Amount"
        type="number"
        name="scale"
        value={scale}
        min={0}
        max={2.0}
        step={0.01}
        withRange
      />
      <Option label="Angle" type="number" name="angle" value={angle} min={0} max={360} withRange />
    </Control>
  );
}

export default withDisplay(DotScreenControl);
