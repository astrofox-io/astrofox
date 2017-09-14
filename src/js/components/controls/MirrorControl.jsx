import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Row } from 'components/controls/Control';

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
        const { active } = this.props,
            { side } = this.state;

        return (
            <Control label="MIRROR" active={active}>
                <Row label="Side">
                    <NumberInput
                        name="side"
                        width={40}
                        value={side}
                        min={0}
                        max={3}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="side"
                            min={0}
                            max={3}
                            value={side}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}