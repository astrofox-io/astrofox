import React, { Component } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
} from 'lib/inputs';

export class RGBShiftControl extends Component {

    render() {
        const {
            display, stageWidth, active, onChange,
            onReactorChange, offset, angle
        } = this.props;

        return (
            <Control
                label="RGB SHIFT"
                active={active}
                display={display}>
                <Option
                    reactorName="offset"
                    reactorMax={stageWidth}
                    onReactorChange={onReactorChange}
                >
                    <Label text="Offset" />
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
                </Option>
                <Option
                    reactorName="angle"
                    reactorMax={360}
                    onReactorChange={onReactorChange}
                >
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

export default DisplayControl(RGBShiftControl);