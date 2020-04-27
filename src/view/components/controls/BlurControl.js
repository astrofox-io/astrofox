import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

const blurOptions = ['Box', 'Circular', 'Gaussian', 'Zoom'];

function BlurControl({ display, active, stageWidth, stageHeight, onChange }) {
  const { x, y, type, amount } = display.properties;

  return (
    <Control label="Blur" active={active} display={display} onChange={onChange}>
      <Option label="Type" type="select" name="type" items={blurOptions} value={type} />
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
      {type === 'Zoom' && (
        <>
          <Option
            label="X"
            type="number"
            name="x"
            value={x}
            min={-stageWidth / 2}
            max={stageWidth / 2}
            withRange
          />
          <Option
            label="Y"
            type="number"
            name="y"
            value={y}
            min={-stageHeight / 2}
            max={stageHeight / 2}
            withRange
          />
        </>
      )}
    </Control>
  );
}

export default withDisplay(BlurControl);
