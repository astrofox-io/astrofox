import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, RangeInput, ReactorInput } from 'components/inputs';

function GlowControl({ displayName, active, amount, intensity, onChange }) {
  return (
    <Control label="Glow" active={active} displayName={displayName}>
      <Option>
        <Label text="Amount" />
        <ReactorInput name="amount">
          <NumberInput
            name="amount"
            width={40}
            value={amount}
            min={0}
            step={0.01}
            max={1}
            onChange={onChange}
          />
          <RangeInput
            name="amount"
            min={0}
            step={0.01}
            max={1}
            value={amount}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
      <Option>
        <Label text="Intensity" />
        <ReactorInput name="intensity" min={1} max={3}>
          <NumberInput
            name="intensity"
            width={40}
            value={intensity}
            min={1}
            step={0.01}
            max={3}
            onChange={onChange}
          />
          <RangeInput
            name="intensity"
            min={1}
            step={0.01}
            max={3}
            value={intensity}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(GlowControl);
