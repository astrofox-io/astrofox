import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

export default function RGBShiftControl({ display, stageWidth, active }) {
  const { offset, angle } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="RGB Shift" active={active} display={display} onChange={onChange}>
      <Option
        label="Offset"
        type="number"
        name="offset"
        value={offset}
        min={0}
        max={stageWidth}
        step={1}
        withRange
      />
      <Option label="Angle" type="number" name="angle" value={angle} min={0} max={360} withRange />
    </Control>
  );
}
