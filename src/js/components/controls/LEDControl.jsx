import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import { Control, Row } from './Control';

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
                <Row label="Spacing">
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={spacing}
                        min={1}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="spacing"
                            min={1}
                            max={100}
                            value={spacing}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={size}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={0}
                            max={100}
                            value={size}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Blur">
                    <NumberInput
                        name="blur"
                        width={40}
                        value={blur}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="blur"
                            min={0}
                            max={100}
                            value={blur}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}