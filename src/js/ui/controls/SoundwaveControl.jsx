'use strict';

var React = require('react');
var Application = require('core/Application.js');
var NumberInput = require('ui/input/NumberInput.jsx');
var ColorInput = require('ui/input/ColorInput.jsx');
var ColorRangeInput = require('ui/input/ColorRangeInput.jsx');
var RangeInput = require('ui/input/RangeInput.jsx');
var ToggleInput = require('ui/input/ToggleInput.jsx');

var defaults = {
    color: '#ffffff',
    height: 240,
    width: 770,
    x: 0,
    y: 0,
    lineWidth: 1.0,
    scrolling: false,
    scrollSpeed: 0.05,
    rotation: 0,
    opacity: 1.0
};

var SoundwaveControl = React.createClass({
    getInitialState: function() {
        return defaults;
    },

    componentWillMount: function() {
        var display = this.props.display;

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

        obj[name] = val;

        this.shouldUpdate = true;
        this.setState(obj, function() {
            display.update(this.state);
        });
    },

    render: function() {
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <div className="header">SOUNDWAVE</div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Line Width</label>
                    <NumberInput
                        name="lineWidth"
                        size="3"
                        value={this.state.lineWidth}
                        min={0}
                        max={10}
                        onChange={this.handleChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="lineWidth"
                            min={0.01}
                            max={10}
                            step={0.01}
                            value={this.state.lineWidth}
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
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        value={this.state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        value={this.state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Scrolling</label>
                    <ToggleInput
                        name="scrolling"
                        value={this.state.scrolling}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Scroll Speed</label>
                    <NumberInput
                        name="scrollSpeed"
                        size="3"
                        min={0}
                        max={0.3}
                        step={0.01}
                        readOnly={!this.state.scrolling}
                        value={this.state.scrollSpeed}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="scrollSpeed"
                            min={0}
                            max={0.3}
                            step={0.01}
                            value={this.state.scrollSpeed}
                            readOnly={!this.state.scrolling}
                            onChange={this.handleChange} />
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
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.1}
                        value={this.state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.1}
                            value={this.state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = SoundwaveControl;