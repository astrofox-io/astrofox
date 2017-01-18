import React from 'react';

import UIComponent from '../UIComponent';
import NumberInput from '../inputs/NumberInput.jsx';
import RangeInput from '../inputs/RangeInput.jsx';
import SelectInput from '../inputs/SelectInput.jsx';
import { Control, Row } from './Control.jsx';

const types = [
    'Box',
    'Circular',
    'Gaussian',
    'Zoom'
];

export default class BlurControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        return (
            <Control label="BLUR" className={this.props.className}>
                <Row label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={types}
                        value={this.state.type}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.amount}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}