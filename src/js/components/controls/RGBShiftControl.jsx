import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

export class RGBShiftControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { display, stageWidth, active, onChange, onReactorChange, offset, angle } = this.props;

        return (
            <Control
                label="RGB SHIFT"
                display={display}
                active={active}>
                <Option
                    label="Offset"
                    reactorName="offset"
                    reactorMax={stageWidth}
                    onReactorChange={onReactorChange}>
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
                    label="Angle"
                    reactorName="angle"
                    reactorMax={360}
                    onReactorChange={onReactorChange}>
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