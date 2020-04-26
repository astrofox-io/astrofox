import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, RangeInput, SelectInput, ReactorInput } from 'components/inputs';

const blendOptions = ['Add', 'Screen'];

function BloomControl({ displayName, active, blendMode, amount, threshold, onChange }) {
  return (
    <Control label="Bloom" active={active} displayName={displayName}>
      <Option>
        <Label text="Blend Mode" />
        <SelectInput
          name="blendMode"
          width={140}
          items={blendOptions}
          value={blendMode}
          onChange={onChange}
        />
      </Option>
      <Option>
        <Label text="Amount" />
        <ReactorInput name="amount">
          <NumberInput
            name="amount"
            width={40}
            value={amount}
            min={0}
            max={1.0}
            step={0.01}
            onChange={onChange}
          />
          <RangeInput
            name="amount"
            min={0}
            max={1.0}
            step={0.01}
            value={amount}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
      <Option>
        <Label text="Threshold" />
        <ReactorInput name="threshold">
          <NumberInput
            name="threshold"
            width={40}
            value={threshold}
            min={0}
            max={1.0}
            step={0.01}
            onChange={onChange}
          />
          <RangeInput
            name="threshold"
            min={0}
            max={1.0}
            step={0.01}
            value={threshold}
            onChange={onChange}
          />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(BloomControl);
