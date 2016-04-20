'use strict';

var React = require('react');
var Application = require('../../core/Application.js');
var NumberInput = require('../inputs/NumberInput.jsx');
var ColorRangeInput = require('../inputs/ColorRangeInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');
var ToggleInput = require('../inputs/ToggleInput.jsx');

var defaults = {
    height: 240,
    width: 770,
    x: 0,
    y: -120,
    barWidth: -1,
    barSpacing: -1,
    barWidthAutoSize: 1,
    barSpacingAutoSize: 1,
    shadowHeight: 100,
    color: ['#ffffff', '#ffffff'],
    shadowColor: ['#333333', '#000000'],
    rotation: 0,
    opacity: 1.0,

    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: 3000
};

var BarSpectrumControl = React.createClass({
    getInitialState: function() {
        return defaults;
    },

    componentWillMount: function() {
        this.shouldUpdate = false;
    },

    componentDidMount: function() {
        var display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
    },

    componentDidUpdate: function() {
        this.shouldUpdate = false;
    },

    shouldComponentUpdate: function() {
        return this.shouldUpdate;
    },

    handleChange: function(name, val) {
        var obj = {},
            display = this.props.display;

        if (name === 'barWidthAutoSize') {
            obj.barWidth = (val) ? -1 : 1;
        }
        else if (name === 'barSpacingAutoSize') {
            obj.barSpacing = (val) ? -1 : 1;
        }

        obj[name] = val;

        this.shouldUpdate = true;
        this.setState(obj, function() {
            display.update(this.state);
        });
    },

    render: function() {
        var maxFrequency = 22000;
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <div className="header">
                    BAR SPECTRUM
                </div>
                <div className="row">
                    <label className="label">Max dB</label>
                    <NumberInput
                        name="maxDecibels"
                        size="3"
                        value={this.state.maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="maxDecibels"
                            min={-40}
                            max={0}
                            step={1}
                            value={this.state.maxDecibels}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Max Frequency</label>
                    <NumberInput
                        name="maxFrequency"
                        size="4"
                        value={this.state.maxFrequency}
                        min={0}
                        max={maxFrequency}
                        step={20}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            min={100}
                            max={maxFrequency}
                            step={20}
                            value={this.state.maxFrequency}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Smoothing</label>
                    <NumberInput
                        name="smoothingTimeConstant"
                        size="3"
                        value={this.state.smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="smoothingTimeConstant"
                            min={0}
                            max={0.99}
                            step={0.01}
                            value={this.state.smoothingTimeConstant}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Width</label>
                    <NumberInput
                        name="width"
                        size="3"
                        value={this.state.width}
                        min={0}
                        max={maxWidth}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth}
                            value={this.state.width}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Height</label>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={maxWidth}
                        value={this.state.height}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxWidth}
                            value={this.state.height}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Shadow Height</label>
                    <NumberInput
                        name="shadowHeight"
                        size="3"
                        min={0}
                        max={maxWidth}
                        value={this.state.shadowHeight}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="shadowHeight"
                            min={0}
                            max={maxWidth}
                            value={this.state.shadowHeight}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Bar Width</label>
                    <NumberInput
                        name="barWidth"
                        size="3"
                        min={-1}
                        max={maxWidth}
                        value={this.state.barWidth}
                        readOnly={this.state.barWidthAutoSize}
                        hidden={this.state.barWidthAutoSize}
                        onChange={this.handleChange}
                    />
                    <label className="label">Auto-Size</label>
                    <ToggleInput
                        name="barWidthAutoSize"
                        value={this.state.barWidthAutoSize}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label className="label">Bar Spacing</label>
                    <NumberInput
                        name="barSpacing"
                        size="3"
                        min={-1}
                        max={maxWidth}
                        value={this.state.barSpacing}
                        readOnly={this.state.barSpacingAutoSize}
                        hidden={this.state.barSpacingAutoSize}
                        onChange={this.handleChange} />
                    <label className="label">Auto-Size</label>
                    <ToggleInput
                        name="barSpacingAutoSize"
                        value={this.state.barSpacingAutoSize}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label className="label">Bar Color</label>
                    <ColorRangeInput
                        name="color"
                        startColor={this.state.color[0]}
                        endColor={this.state.color[1]}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label className="label">Shadow Color</label>
                    <ColorRangeInput
                        name="shadowColor"
                        startColor={this.state.shadowColor[0]}
                        endColor={this.state.shadowColor[1]}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BarSpectrumControl;