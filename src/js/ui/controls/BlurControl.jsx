import React from 'react';

import UIComponent from '../UIComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import SelectInput from '../inputs/SelectInput';
import { Control, Row } from './Control';

const types = [
    'Box',
    'Circular',
    'Gaussian',
    'Zoom'
];

export default class BlurControl extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = this.props.display.options;

        this.app = context.app;
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
        let centerOptions,
            state = this.state,
            { width, height } = this.app.stage.getSize();

        if (state.type === 'Zoom') {
            centerOptions = [
                <Row label="X" key="x">
                    <NumberInput
                        name="x"
                        min={-width/2}
                        max={width/2}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-width/2}
                            max={width/2}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>,
                <Row label="Y" key="y">
                    <NumberInput
                        name="y"
                        min={-height/2}
                        max={height/2}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-height/2}
                            max={height/2}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            ];
        }

        return (
            <Control label="BLUR" className={this.props.className}>
                <Row label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={types}
                        value={state.type}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={state.amount}
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
                            value={state.amount}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                {centerOptions}
            </Control>
        );
    }
}

BlurControl.contextTypes = {
    app: React.PropTypes.object
};