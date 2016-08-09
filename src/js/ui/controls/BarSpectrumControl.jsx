'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const ColorRangeInput = require('../inputs/ColorRangeInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const autoBind = require('../../util/autoBind.js');

const defaults = {
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
    maxFrequency: 6000
};

class BarSpectrumControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
        
        this.state = defaults;
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

        if (name === 'barWidthAutoSize') {
            obj.barWidth = (val) ? -1 : 1;
        }
        else if (name === 'barSpacingAutoSize') {
            obj.barSpacing = (val) ? -1 : 1;
        }

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
                    BAR SPECTRUM
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
                    <span className="label">Shadow Height</span>
                    <NumberInput
                        name="shadowHeight"
                        size="3"
                        min={0}
                        max={maxWidth}
                        value={this.state.shadowHeight}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="shadowHeight"
                            min={0}
                            max={maxWidth}
                            value={this.state.shadowHeight}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Bar Width</span>
                    <NumberInput
                        name="barWidth"
                        size="3"
                        min={-1}
                        max={maxWidth}
                        value={this.state.barWidth}
                        readOnly={this.state.barWidthAutoSize}
                        hidden={this.state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barWidthAutoSize"
                        value={this.state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Bar Spacing</span>
                    <NumberInput
                        name="barSpacing"
                        size="3"
                        min={-1}
                        max={maxWidth}
                        value={this.state.barSpacing}
                        readOnly={this.state.barSpacingAutoSize}
                        hidden={this.state.barSpacingAutoSize}
                        onChange={this.onChange} />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barSpacingAutoSize"
                        value={this.state.barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Bar Color</span>
                    <ColorRangeInput
                        name="color"
                        startColor={this.state.color[0]}
                        endColor={this.state.color[1]}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Shadow Color</span>
                    <ColorRangeInput
                        name="shadowColor"
                        startColor={this.state.shadowColor[0]}
                        endColor={this.state.shadowColor[1]}
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

module.exports = BarSpectrumControl;