import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

const renderOptions = ['Square', 'Hexagon'];
const minPixelSize = 2;
const maxPixelSize = 240;

export default function PixelateControl({ display, active }) {
  const { type, size } = display.properties;
  const onChange = useEntity(display);

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
