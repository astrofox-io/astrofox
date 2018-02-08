import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    SelectInput,
    ReactorInput,
} from 'lib/inputs';

const blurOptions = [
    'Box',
    'Circular',
    'Gaussian',
    'Zoom'
];

export class BlurControl extends PureComponent {
    static contextTypes = {
        app: PropTypes.object
    }

    render() {
        const {
            display,
            active,
            stageWidth,
            stageHeight,
            x,
            y,
            type,
            amount,
            onChange,
        } = this.props;

        return (
            <Control
                label="BLUR"
                display={display}
                active={active}
            >
                <Option>
                    <Label text="Type" />
                    <SelectInput
                        name="type"
                        width={140}
                        items={blurOptions}
                        value={type}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Amount" />
                    <ReactorInput name="amount">
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
                    </ReactorInput>
                </Option>
                {
                    type === 'Zoom' &&
                    <Fragment>
                        <Option>
                            <Label text="X" />
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
                        </Option>
                        <Option>
                            <Label text="Y" />
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
                    </Fragment>
                }
            </Control>
        );
    }
}

export default DisplayControl(BlurControl);