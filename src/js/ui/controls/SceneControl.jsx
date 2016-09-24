'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const { Control, Row } = require('./Control.jsx');

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

class SceneControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        if (name === 'blendMode' && typeof val !== 'string') {
            return;
        }

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxVal = 500;

        return (
            <Control title="SCENE">
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
            </Control>
        );
    }
}

module.exports = SceneControl;