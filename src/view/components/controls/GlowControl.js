import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

function GlowControl({ display, active, onChange }) {
  const { amount, intensity } = display.properties;

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

export default withDisplay(GlowControl);
