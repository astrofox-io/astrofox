import React from 'react';
import propTypes from 'prop-types';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';

const types = [
    'Box',
    'Circular',
    'Gaussian',
    'Zoom'
];

export class BlurControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let centerOptions,
            {
                display, active, stageWidth, stageHeight, onChange, onReactorChange,
                x, y, type, amount
            } = this.props;

        if (type === 'Zoom') {
            centerOptions = [
                <Option label="X" key="x">
                    <NumberInput
                        name="x"
                        min={-stageWidth/2}
                        max={stageWidth/2}
                        value={x}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth/2}
                        max={stageWidth/2}
                        value={x}
                        onChange={onChange}
                    />
                </Option>,
                <Option label="Y" key="y">
                    <NumberInput
                        name="y"
                        min={-stageHeight/2}
                        max={stageHeight/2}
                        value={y}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight/2}
                        max={stageHeight/2}
                        value={y}
                        onChange={onChange}
                    />
                </Option>
            ];
        }

        return (
            <Control
                label="BLUR"
                display={display}
                active={active}>
                <Option label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={types}
                        value={type}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    label="Amount"
                    reactorName="amount"
                    onReactorChange={onReactorChange}>
                    <NumberInput
                        name="amount"
                        width={40}
                        value={amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={amount}
                        onChange={onChange}
                    />
                </Option>
                {centerOptions}
            </Control>
        );
    }
}

BlurControl.contextTypes = {
    app: propTypes.object
};

export default DisplayControl(BlurControl);