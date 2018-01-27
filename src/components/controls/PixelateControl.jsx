import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';

const TYPES = [
    'Square',
    'Hexagon'
];

const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 240;

export class PixelateControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { display, active, type, size, onChange, onReactorChange } = this.props;

        return (
            <Control label="PIXELATE" active={active} display={display}>
                <Option label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={TYPES}
                        value={type}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    label="Size"
                    reactorName="size"
                    reactorMin={MIN_PIXEL_SIZE}
                    reactorMax={MAX_PIXEL_SIZE}
                    onReactorChange={onReactorChange}>
                    <NumberInput
                        name="size"
                        width={40}
                        value={size}
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="size"
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        value={size}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(PixelateControl);