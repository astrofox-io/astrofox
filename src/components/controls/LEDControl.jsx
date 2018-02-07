import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
} from 'lib/inputs';

export class LEDControl extends PureComponent {
    render() {
        const { display, active, spacing, size, blur, onChange, onReactorChange } = this.props;

        return (
            <Control label="LED" active={active} display={display}>
                <Option
                    reactorName="spacing"
                    reactorMin={1}
                    reactorMax={100}
                    onReactorChange={onReactorChange}>
                    <Label text="Spacing" />
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={spacing}
                        min={1}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="spacing"
                        min={1}
                        max={100}
                        value={spacing}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    reactorName="size"
                    reactorMax={100}
                    onReactorChange={onReactorChange}>
                    <Label text="Size" />
                    <NumberInput
                        name="size"
                        width={40}
                        value={size}
                        min={0}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="size"
                        min={0}
                        max={100}
                        value={size}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    reactorName="blur"
                    reactorMax={100}
                    onReactorChange={onReactorChange}>
                    <Label text="Blur" />
                    <NumberInput
                        name="blur"
                        width={40}
                        value={blur}
                        min={0}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="blur"
                        min={0}
                        max={100}
                        value={blur}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(LEDControl);