import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

const blendOptions = ['Add', 'Screen'];

export default function BloomControl({ display, active }) {
  const { blendMode, amount, threshold } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Bloom" active={active} display={display} onChange={onChange}>
      <Option
        label="Blend Mode"
        type="select"
        name="blendMode"
        items={blendOptions}
        value={blendMode}
      />
      <Option
        label="Amount"
        type="number"
        name="amount"
        value={amount}
        min={0}
        max={1.0}
        step={0.01}
        withRange
        withReactor
      />
      <Option
        label="Threshold"
        type="number"
        name="threshold"
        value={threshold}
        min={0}
        max={1.0}
        step={0.01}
        withRange
        withReactor
      />
    </Control>
  );
}
