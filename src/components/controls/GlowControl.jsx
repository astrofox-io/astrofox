import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    ReactorInput,
} from 'lib/inputs';

export class GlowControl extends PureComponent {
    render() {
        const {
            display,
            active,
            amount,
            intensity,
            onChange,
        } = this.props;

        return (
            <Control
                label="GLOW"
                active={active}
                display={display}
            >
                <Option>
                    <Label text="Amount" />
                    <ReactorInput name="amount">
                        <NumberInput
                            name="amount"
                            width={40}
                            value={amount}
                            min={0}
                            step={0.01}
                            max={1}
                            onChange={onChange}
                        />
                        <RangeInput
                            name="amount"
                            min={0}
                            step={0.01}
                            max={1}
                            value={amount}
                            onChange={onChange}
                        />
                    </ReactorInput>
                </Option>
                <Option>
                    <Label text="Intensity" />
                    <ReactorInput
                        name="intensity"
                        min={1}
                        max={3}
                    >
                        <NumberInput
                            name="intensity"
                            width={40}
                            value={intensity}
                            min={1}
                            step={0.01}
                            max={3}
                            onChange={onChange}
                        />
                        <RangeInput
                            name="intensity"
                            min={1}
                            step={0.01}
                            max={3}
                            value={intensity}
                            onChange={onChange}
                        />
                    </ReactorInput>
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(GlowControl);