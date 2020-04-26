import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { SelectInput } from 'components/inputs';

const mirrorOptions = [
  { name: 'Left', value: 0 },
  { name: 'Right', value: 1 },
  { name: 'Top', value: 2 },
  { name: 'Bottom', value: 3 },
];

function MirrorControl({ displayName, active, side, onChange }) {
  return (
    <Control label="Mirror" active={active} displayName={displayName}>
      <Option>
        <Label text="Side" />
        <SelectInput
          name="side"
          width={140}
          items={mirrorOptions}
          value={side}
          onChange={onChange}
        />
      </Option>
    </Control>
  );
}

export default DisplayControl(MirrorControl);
