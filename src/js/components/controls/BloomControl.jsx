import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import { Control, Option } from 'components/controls/Control';

const blendModes = [
    'Add',
    'Screen'
];

export default class BloomControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        const { active } = this.props,
            { blendMode, amount, threshold } = this.state;

        return (
            <Control label="BLOOM" active={active}>
                <Option label="Blend Mode">
                    <SelectInput
                        name="blendMode"
                        width={140}
                        items={blendModes}
                        value={blendMode}
                        onChange={this.onChange}
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
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={amount}
                        onChange={this.onChange}
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
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="threshold"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={threshold}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}