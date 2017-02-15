import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import { Control, Row } from './Control';

const OFFSET_MAX = 854;

export default class RGBShiftControl extends UIPureComponent {
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
            <Control label="RGB SHIFT" className={this.props.className}>
                <Row label="Offset">
                    <NumberInput
                        name="offset"
                        width={40}
                        value={this.state.offset}
                        min={0}
                        max={OFFSET_MAX}
                        step={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="offset"
                            min={0.0}
                            max={OFFSET_MAX}
                            step={1}
                            value={this.state.offset}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Angle">
                    <NumberInput
                        name="angle"
                        width={40}
                        value={this.state.angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="angle"
                            min={0}
                            max={360}
                            value={this.state.angle}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}