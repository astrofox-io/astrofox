import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    ReactorInput,
} from 'lib/inputs';

export class RGBShiftControl extends PureComponent {
    render() {
        const {
            display,
            stageWidth,
            active,
            onChange,
            offset,
            angle,
        } = this.props;

        return (
            <Control
                label="RGB SHIFT"
                active={active}
                display={display}>
                <Option>
                    <Label text="Offset" />
                    <ReactorInput
                        name="offset"
                        max={stageWidth}
                    >
                        <NumberInput
                            name="offset"
                            width={40}
                            value={offset}
                            min={0}
                            max={stageWidth}
                            step={1}
                            onChange={onChange}
                        />
                        <RangeInput
                            name="offset"
                            min={0.0}
                            max={stageWidth}
                            step={1}
                            value={offset}
                            onChange={onChange}
                        />
                    </ReactorInput>
                </Option>
                <Option>
                    <Label text="Angle" />
                    <ReactorInput
                        name="angle"
                        max={360}
                    >
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
                    </ReactorInput>
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(RGBShiftControl);
