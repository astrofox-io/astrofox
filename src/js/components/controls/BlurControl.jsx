import React from 'react';
import propTypes from 'prop-types';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import { Control, Row } from 'components/controls/Control';

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

    render() {
        let centerOptions,
            state = this.state,
            { active, stageWidth, stageHeight } = this.props;

        if (state.type === 'Zoom') {
            centerOptions = [
                <Row label="X" key="x">
                    <NumberInput
                        name="x"
                        min={-stageWidth/2}
                        max={stageWidth/2}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-stageWidth/2}
                            max={stageWidth/2}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>,
                <Row label="Y" key="y">
                    <NumberInput
                        name="y"
                        min={-stageHeight/2}
                        max={stageHeight/2}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-stageHeight/2}
                            max={stageHeight/2}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            ];
        }

        return (
            <Control label="BLUR" active={active}>
                <Row label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={types}
                        value={state.type}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={state.amount}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                {centerOptions}
            </Control>
        );
    }
}

BlurControl.contextTypes = {
    app: propTypes.object
};