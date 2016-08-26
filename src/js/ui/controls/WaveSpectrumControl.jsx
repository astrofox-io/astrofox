'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const ColorInput = require('../inputs/ColorInput.jsx');
const ColorRangeInput = require('../inputs/ColorRangeInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');

class WaveSpectrumControl extends UIComponent {
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

        obj[name] = val;

        this.shouldUpdate = true;
        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxFrequency = 22000;
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <div className="control">
                <div className="header">
                    WAVE SPECTRUM
                </div>
                <div className="row">
                    <span className="label">Max dB</span>
                    <NumberInput
                        name="maxDecibels"
                        size="3"
                        value={this.state.maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="maxDecibels"
                            min={-40}
                            max={0}
                            step={1}
                            value={this.state.maxDecibels}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Max Frequency</span>
                    <NumberInput
                        name="maxFrequency"
                        size="4"
                        value={this.state.maxFrequency}
                        min={0}
                        max={maxFrequency}
                        step={20}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            min={100}
                            max={maxFrequency}
                            step={20}
                            value={this.state.maxFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Smoothing</span>
                    <NumberInput
                        name="smoothingTimeConstant"
                        size="3"
                        value={this.state.smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="smoothingTimeConstant"
                            min={0}
                            max={0.99}
                            step={0.01}
                            value={this.state.smoothingTimeConstant}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Width</span>
                    <NumberInput
                        name="width"
                        size="3"
                        value={this.state.width}
                        min={0}
                        max={maxWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth}
                            value={this.state.width}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Height</span>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={maxWidth}
                        value={this.state.height}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxWidth}
                            value={this.state.height}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Stroke</span>
                    <ToggleInput
                        name="stroke"
                        value={this.state.stroke}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Stroke Color</span>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Fill</span>
                    <ToggleInput
                        name="fill"
                        value={this.state.fill}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Fill Color</span>
                    <ColorRangeInput
                        name="fillColor"
                        startColor={this.state.fillColor[0]}
                        endColor={this.state.fillColor[1]}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">X</span>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Y</span>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Rotation</span>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Opacity</span>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = WaveSpectrumControl;