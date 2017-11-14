import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

export class DotScreenControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { display, active, scale, angle, onChange, onReactorChange } = this.props;

        return (
            <Control label="DOT SCREEN" active={active} display={display}>
                <Option
                    label="Amount"
                    reactorName="scale"
                    onReactorChange={onReactorChange}>
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
                    label="Angle"
                    reactorName="angle"
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

export default DisplayControl(DotScreenControl);