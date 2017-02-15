import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import { Control, Row } from './Control';

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
        return (
            <Control label="GLOW" className={this.props.className}>
                <Row label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={this.state.amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            step={0.01}
                            max={1}
                            value={this.state.amount}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Intensity">
                    <NumberInput
                        name="intensity"
                        width={40}
                        value={this.state.intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="intensity"
                            min={1}
                            step={0.01}
                            max={3}
                            value={this.state.intensity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}