import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Option } from 'components/controls/Control';

export default class LEDControl extends UIPureComponent {
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
            { spacing, size, blur } = this.state;

        return (
            <Control label="LED" active={active}>
                <Option label="Spacing">
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={spacing}
                        min={1}
                        max={100}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="spacing"
                        min={1}
                        max={100}
                        value={spacing}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={size}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="size"
                        min={0}
                        max={100}
                        value={size}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Blur">
                    <NumberInput
                        name="blur"
                        width={40}
                        value={blur}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="blur"
                        min={0}
                        max={100}
                        value={blur}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}