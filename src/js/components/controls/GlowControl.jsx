import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

export class GlowControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { display, active, amount, intensity, onChange, onReactorChange } = this.props;

        return (
            <Control
                label="GLOW"
                active={active}
                display={display}>
                <Option
                    label="Amount"
                    reactorName="amount"
                    onReactorChange={onReactorChange}>
                    <NumberInput
                        name="amount"
                        width={40}
                        value={amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        step={0.01}
                        max={1}
                        value={amount}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    label="Intensity"
                    reactorName="intensity"
                    onReactorChange={onReactorChange}>
                    <NumberInput
                        name="intensity"
                        width={40}
                        value={intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="intensity"
                        min={1}
                        step={0.01}
                        max={3}
                        value={intensity}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(GlowControl);