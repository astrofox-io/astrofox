import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    ReactorInput,
} from 'lib/inputs';

export class LEDControl extends PureComponent {
    render() {
        const {
            display,
            active,
            spacing,
            size,
            blur,
            onChange,
        } = this.props;

        return (
            <Control
                label="LED"
                active={active}
                display={display}
            >
                <Option>
                    <Label text="Spacing" />
                    <ReactorInput
                        name="spacing"
                        min={1}
                        max={100}
                    >
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
                    </ReactorInput>
                </Option>
                <Option>
                    <Label text="Size" />
                    <ReactorInput
                        name="size"
                        max={100}
                    >
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
                    </ReactorInput>
                </Option>
                <Option>
                    <Label text="Blur" />
                    <ReactorInput
                        name="blur"
                        max={100}
                    >
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
                    </ReactorInput>
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(LEDControl);