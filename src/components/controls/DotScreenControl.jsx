import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
} from 'lib/inputs';

export class DotScreenControl extends PureComponent {
    render() {
        const { display, active, scale, angle, onChange, onReactorChange } = this.props;

        return (
            <Control label="DOT SCREEN" active={active} display={display}>
                <Option
                    reactorName="scale"
                    onReactorChange={onReactorChange}>
                    <Label text="Amount" />
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
                </Option>
                <Option
                    reactorName="angle"
                    onReactorChange={onReactorChange}>
                    <Label text="Angle" />
                    <NumberInput
                        name="angle"
                        width={40}
                        value={angle}
                        min={0}
                        max={360}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="angle"
                        min={0}
                        max={360}
                        value={angle}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(DotScreenControl);