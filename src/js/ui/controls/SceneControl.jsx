'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const autoBind = require('../../util/autoBind.js');

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

class SceneControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Object.assign({}, this.props.display.constructor.defaults)
    }

    componentWillMount() {
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
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

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxVal = 500;

        return (
            <div className="control">
                <div className="header">SCENE</div>
                <div className="row">
                    <span className="label">Blending</span>
                    <SelectInput
                        name="blendMode"
                        size="20"
                        items={blendModesMenu}
                        value={this.state.blendMode}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Opacity</span>
                    <NumberInput
                        name="opacity"
                        size="3"
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
                </div>
                <div className="row">
                    <span className="label">Light Intensity</span>
                    <NumberInput
                        name="lightIntensity"
                        size="3"
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={this.state.lightIntensity}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="lightIntensity"
                            min={0.0}
                            max={10.0}
                            step={0.1}
                            value={this.state.lightIntensity}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Light Distance</span>
                    <NumberInput
                        name="lightDistance"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={this.state.lightDistance}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="lightDistance"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.lightDistance}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Camera Zoom</span>
                    <NumberInput
                        name="cameraZoom"
                        size="3"
                        min={0}
                        max={1000}
                        value={this.state.cameraZoom}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="cameraZoom"
                            min={0}
                            max={1000}
                            value={this.state.cameraZoom}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SceneControl;