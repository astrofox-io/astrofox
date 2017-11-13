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
        const { active, scale, angle, onChange } = this.props;

        return (
            <Control label="DOT SCREEN" active={active}>
                <Option label="Amount">
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
                <Option label="Angle">
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