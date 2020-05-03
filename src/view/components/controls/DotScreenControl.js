import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

export default function DotScreenControl({ display, active }) {
  const { scale, angle } = display.properties;
  const onChange = useEntity(display);

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
