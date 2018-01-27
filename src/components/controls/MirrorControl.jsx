import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

export class MirrorControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, side, onChange } = this.props;

        return (
            <Control label="MIRROR" active={active}>
                <Option label="Side">
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