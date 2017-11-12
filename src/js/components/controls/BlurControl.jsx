import React from 'react';
import propTypes from 'prop-types';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import { Control, Option } from 'components/controls/Control';

const types = [
    'Box',
    'Circular',
    'Gaussian',
    'Zoom'
];

export default class BlurControl extends UIPureComponent {
    constructor(props, context) {
        super(props);

        this.state = this.props.display.options;

        this.app = context.app;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    onReactorChange(name, options) {
        this.props.display.setReactor(name, options);
        this.forceUpdate();
    }

    render() {
        let centerOptions,
            state = this.state,
            { display, active, stageWidth, stageHeight } = this.props;

        if (state.type === 'Zoom') {
            centerOptions = [
                <Option label="X" key="x">
                    <NumberInput
                        name="x"
                        min={-stageWidth/2}
                        max={stageWidth/2}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth/2}
                        max={stageWidth/2}
                        value={state.x}
                        onChange={this.onChange}
                    />
                </Option>,
                <Option label="Y" key="y">
                    <NumberInput
                        name="y"
                        min={-stageHeight/2}
                        max={stageHeight/2}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight/2}
                        max={stageHeight/2}
                        value={state.y}
                        onChange={this.onChange}
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
                        value={state.type}
                        onChange={this.onChange}
                    />
                </Option>
                <Option
                    label="Amount"
                    reactorName="amount"
                    onReactorChange={this.onReactorChange}>
                    <NumberInput
                        name="amount"
                        width={40}
                        value={state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="amount"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.amount}
                        onChange={this.onChange}
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