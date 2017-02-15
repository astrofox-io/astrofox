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
        return (
            <Control label="LED" className={this.props.className}>
                <Row label="Spacing">
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={this.state.spacing}
                        min={1}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="spacing"
                            min={1}
                            max={100}
                            value={this.state.spacing}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={this.state.size}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={0}
                            max={100}
                            value={this.state.size}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Blur">
                    <NumberInput
                        name="blur"
                        width={40}
                        value={this.state.blur}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="blur"
                            min={0}
                            max={100}
                            value={this.state.blur}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}