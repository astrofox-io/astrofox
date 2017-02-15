import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import { Control, Row } from './Control';

export default class MirrorControl extends UIPureComponent {
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
            <Control label="MIRROR" className={this.props.className}>
                <Row label="Side">
                    <NumberInput
                        name="side"
                        width={40}
                        value={this.state.side}
                        min={0}
                        max={3}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="side"
                            min={0}
                            max={3}
                            value={this.state.side}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}