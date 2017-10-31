import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Option } from 'components/controls/Control';

export default class GlowControl extends UIPureComponent {
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
            { amount, intensity } = this.state;

        return (
            <Control label="GLOW" active={active}>
                <Option label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        step={0.01}
                        max={1}
                        value={amount}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Intensity">
                    <NumberInput
                        name="intensity"
                        width={40}
                        value={intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="intensity"
                        min={1}
                        step={0.01}
                        max={3}
                        value={intensity}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}