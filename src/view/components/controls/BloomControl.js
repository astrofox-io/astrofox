import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

const blendOptions = ['Add', 'Screen'];

function BloomControl({ display, active, onChange }) {
  const { blendMode, amount, threshold } = display.properties;

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
      />
    </Control>
  );
}

export default withDisplay(BloomControl);
