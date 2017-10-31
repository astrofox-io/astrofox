import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Option } from 'components/controls/Control';

export default class DotScreenControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;
        
        this.setState(obj, () => {
            display.update(this.state);
        });
    }

    render() {
        const { active } = this.props,
            { scale, angle } = this.state;

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
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="scale"
                        min={0.0}
                        max={2.0}
                        step={0.01}
                        value={scale}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Angle">
                    <NumberInput
                        name="angle"
                        width={40}
                        value={angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="angle"
                        min={0}
                        max={360}
                        value={angle}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}