import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
} from 'lib/inputs';

export class MirrorControl extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, side, onChange } = this.props;

        return (
            <Control label="MIRROR" active={active}>
                <Option>
                    <Label text="Side" />
                    <NumberInput
                        name="side"
                        width={40}
                        value={side}
                        min={0}
                        max={3}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="side"
                        min={0}
                        max={3}
                        value={side}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(MirrorControl);