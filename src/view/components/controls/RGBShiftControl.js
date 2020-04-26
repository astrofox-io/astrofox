import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, RangeInput, ReactorInput } from 'components/inputs';

function RGBShiftControl({ displayName, stageWidth, active, onChange, offset, angle }) {
  return (
    <Control label="RGB Shift" active={active} displayName={displayName}>
      <Option>
        <Label text="Offset" />
        <ReactorInput name="offset" max={stageWidth}>
          <NumberInput
            name="offset"
            width={40}
            value={offset}
            min={0}
            max={stageWidth}
            step={1}
            onChange={onChange}
          />
          <RangeInput
            name="offset"
            min={0.0}
            max={stageWidth}
            step={1}
            value={offset}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
      <Option>
        <Label text="Angle" />
        <ReactorInput name="angle" max={360}>
          <NumberInput
            name="angle"
            width={40}
            value={angle}
            min={0}
            max={360}
            onChange={onChange}
          />
          <RangeInput name="angle" min={0} max={360} value={angle} onChange={onChange} />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(RGBShiftControl);
