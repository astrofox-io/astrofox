import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

const mirrorOptions = [
  { name: 'Left', value: 0 },
  { name: 'Right', value: 1 },
  { name: 'Top', value: 2 },
  { name: 'Bottom', value: 3 },
];

function MirrorControl({ display, active, onChange }) {
  const { side } = display.properties;

  return (
    <Control label="Mirror" active={active} display={display} onChange={onChange}>
      <Option label="Side" type="select" name="side" items={mirrorOptions} value={side} />
    </Control>
  );
}

export default withDisplay(MirrorControl);
