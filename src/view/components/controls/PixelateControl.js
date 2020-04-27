import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

const renderOptions = ['Square', 'Hexagon'];
const minPixelSize = 2;
const maxPixelSize = 240;

function PixelateControl({ display, active, onChange }) {
  const { type, size } = display.properties;

  return (
    <Control label="Pixelate" active={active} display={display} onChange={onChange}>
      <Option label="Type" type="select" name="type" items={renderOptions} value={type} />
      <Option
        label="Size"
        type="number"
        name="size"
        value={size}
        min={minPixelSize}
        max={maxPixelSize}
        withRange
      />
    </Control>
  );
}

export default withDisplay(PixelateControl);
