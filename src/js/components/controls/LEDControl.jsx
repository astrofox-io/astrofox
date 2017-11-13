import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

export class LEDControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, spacing, size, blur, onChange } = this.props;

        return (
            <Control label="LED" active={active}>
                <Option label="Spacing">
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={spacing}
                        min={1}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="spacing"
                        min={1}
                        max={100}
                        value={spacing}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={size}
                        min={0}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="size"
                        min={0}
                        max={100}
                        value={size}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Blur">
                    <NumberInput
                        name="blur"
                        width={40}
                        value={blur}
                        min={0}
                        max={100}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="blur"
                        min={0}
                        max={100}
                        value={blur}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(LEDControl);