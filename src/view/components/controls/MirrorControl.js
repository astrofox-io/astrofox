import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { SelectInput } from 'components/inputs';

const mirrorOptions = [
  { name: 'Left', value: 0 },
  { name: 'Right', value: 1 },
  { name: 'Top', value: 2 },
  { name: 'Bottom', value: 3 },
];

export class MirrorControl extends PureComponent {
  render() {
    const { display, active, side, onChange } = this.props;

    return (
      <Control label="Mirror" display={display} active={active}>
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
}

export default DisplayControl(MirrorControl);
