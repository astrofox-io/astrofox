import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';

const BLEND_MODES = [
    'Add',
    'Screen'
];

export class BloomControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, blendMode, amount, threshold, onChange } = this.props;

        return (
            <Control label="BLOOM" active={active}>
                <Option label="Blend Mode">
                    <SelectInput
                        name="blendMode"
                        width={140}
                        items={BLEND_MODES}
                        value={blendMode}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={amount}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Threshold">
                    <NumberInput
                        name="threshold"
                        width={40}
                        value={threshold}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="threshold"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={threshold}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(BloomControl);