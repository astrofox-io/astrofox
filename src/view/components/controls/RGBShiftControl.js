import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

function RGBShiftControl({ display, stageWidth, active, onChange }) {
  const { offset, angle } = display.properties;

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

export default withDisplay(RGBShiftControl);
