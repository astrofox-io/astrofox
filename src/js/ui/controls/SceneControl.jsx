import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import SelectInput from '../inputs/SelectInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

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
            display = this.props.display;

        if (name === 'blendMode' && typeof val !== 'string') {
            return;
        }

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxVal = 500;

        return (
            <Control label="SCENE" className={this.props.className}>
                <Row label="Blending">
                    <SelectInput
                        name="blendMode"
                        width={140}
                        items={blendModesMenu}
                        value={this.state.blendMode}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        value={this.state.opacity}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Light Intensity">
                    <NumberInput
                        name="lightIntensity"
                        width={40}
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={this.state.lightIntensity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="lightIntensity"
                            min={0.0}
                            max={10.0}
                            step={0.1}
                            value={this.state.lightIntensity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Light Distance">
                    <NumberInput
                        name="lightDistance"
                        width={40}
                        min={-maxVal}
                        max={maxVal}
                        value={this.state.lightDistance}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="lightDistance"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.lightDistance}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Camera Zoom">
                    <NumberInput
                        name="cameraZoom"
                        width={40}
                        min={0}
                        max={1000}
                        value={this.state.cameraZoom}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="cameraZoom"
                            min={0}
                            max={1000}
                            value={this.state.cameraZoom}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Mask">
                    <ToggleInput
                        name="mask"
                        value={this.state.mask}
                        onChange={this.onChange}
                    />
                    <span className="label">Inverse</span>
                    <ToggleInput
                        name="inverse"
                        value={this.state.inverse}
                        onChange={this.onChange}
                    />
                </Row>
            </Control>
        );
    }
}