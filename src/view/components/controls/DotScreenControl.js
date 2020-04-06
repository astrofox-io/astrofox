import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, RangeInput, ReactorInput } from 'components/inputs';

export class DotScreenControl extends PureComponent {
  render() {
    const { display, active, scale, angle, onChange } = this.props;

    return (
      <Control label="Dot Screen" active={active} display={display}>
        <Option>
          <Label text="Amount" />
          <ReactorInput name="scale">
            <NumberInput
              name="scale"
              width={40}
              value={scale}
              min={0}
              max={2.0}
              step={0.01}
              onChange={onChange}
            />
            <RangeInput
              name="scale"
              min={0.0}
              max={2.0}
              step={0.01}
              value={scale}
              onChange={onChange}
            />
          </ReactorInput>
        </Option>
        <Option>
          <Label text="Angle" />
          <ReactorInput name="angle">
            <NumberInput
              name="angle"
              width={40}
              value={angle}
              min={0}
              max={360}
              onChange={onChange}
            />
            <RangeInput name="angle" min={0} max={360} value={angle} onChange={onChange} />
          </ReactorInput>
        </Option>
      </Control>
    );
  }
}

export default DisplayControl(DotScreenControl);
