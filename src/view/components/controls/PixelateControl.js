import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, RangeInput, SelectInput, ReactorInput } from 'components/inputs';

const renderOptions = ['Square', 'Hexagon'];
const minPixelSize = 2;
const maxPixelSize = 240;

function PixelateControl({ displayName, active, type, size, onChange }) {
  return (
    <Control label="Pixelate" active={active} displayName={displayName}>
      <Option>
        <Label text="Type" />
        <SelectInput
          name="type"
          width={140}
          items={renderOptions}
          value={type}
          onChange={onChange}
        />
      </Option>
      <Option>
        <Label text="Size" />
        <ReactorInput name="size" min={minPixelSize} max={maxPixelSize}>
          <NumberInput
            name="size"
            width={40}
            value={size}
            min={minPixelSize}
            max={maxPixelSize}
            onChange={onChange}
          />
          <RangeInput
            name="size"
            min={minPixelSize}
            max={maxPixelSize}
            value={size}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(PixelateControl);
