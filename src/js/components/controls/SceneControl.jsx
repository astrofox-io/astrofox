import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Option } from 'components/controls/Control';

const blendModesMenu = [
    'None',
    'Normal',
    { separator: true },
    'Darken',
    'Multiply',
    'Color Burn',
    'Linear Burn',
    { separator: true },
    'Lighten',
    'Screen',
    'Color Dodge',
    'Linear Dodge',
    { separator: true },
    'Overlay',
    'Soft Light',
    'Hard Light',
    'Vivid Light',
    'Linear Light',
    'Pin Light',
    'Hard Mix',
    { separator: true },
    'Difference',
    'Exclusion',
    'Subtract',
    'Divide',
    { separator: true },
    'Negation',
    'Phoenix',
    'Glow',
    'Reflect'
];

export default class SceneControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            { display } = this.props;

        // Ignore separators
        if (name === 'blendMode' && typeof val !== 'string') {
            return;
        }

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
        const { active, display } = this.props,
            state = this.state;

        return (
            <Control label="SCENE" active={active} display={display}>
                <Option label="Blending">
                    <SelectInput
                        name="blendMode"
                        width={140}
                        items={blendModesMenu}
                        value={state.blendMode}
                        onChange={this.onChange}
                    />
                </Option>
                <Option
                    label="Opacity"
                    reactorName="opacity"
                    onReactorChange={this.onReactorChange}>
                    <NumberInput
                        name="opacity"
                        width={40}
                        value={state.opacity}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Light Intensity">
                    <NumberInput
                        name="lightIntensity"
                        width={40}
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={state.lightIntensity}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="lightIntensity"
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={state.lightIntensity}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Light Distance">
                    <NumberInput
                        name="lightDistance"
                        width={40}
                        min={-500}
                        max={500}
                        value={state.lightDistance}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="lightDistance"
                        min={-500}
                        max={500}
                        value={state.lightDistance}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Camera Zoom">
                    <NumberInput
                        name="cameraZoom"
                        width={40}
                        min={0}
                        max={1000}
                        value={state.cameraZoom}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="cameraZoom"
                        min={0}
                        max={1000}
                        value={state.cameraZoom}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Mask">
                    <ToggleInput
                        name="mask"
                        value={state.mask}
                        onChange={this.onChange}
                    />
                    <span className="label">Inverse</span>
                    <ToggleInput
                        name="inverse"
                        value={state.inverse}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}