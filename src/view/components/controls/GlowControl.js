import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

export default function GlowControl({ display, active }) {
  const { amount, intensity } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Glow" active={active} display={display} onChange={onChange}>
      <Option
        label="Amount"
        type="number"
        name="amount"
        value={amount}
        min={0}
        step={0.01}
        max={1}
        withRange
      />
      <Option
        label="Intensity"
        type="number"
        name="intensity"
        value={intensity}
        min={1}
        step={0.01}
        max={3}
        withRange
      />
    </Control>
  );
}
