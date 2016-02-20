'use strict';

var React = require('react');
var THREE = require('three');

var NumberInput = require('../inputs/NumberInput.jsx');
var ToggleInput = require('../inputs/ToggleInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');
var SelectInput = require('../inputs/SelectInput.jsx');
var BlendModes = require('../../graphics/BlendModes.js');

var blendModes = [
    "None",
    "Normal",
    "----",
    "Darken",
    "Multiply",
    "Color Burn",
    "Linear Burn",
    '----',
    "Lighten",
    "Screen",
    "Color Dodge",
    "Linear Dodge",
    '----',
    "Overlay",
    "Soft Light",
    "Hard Light",
    "Vivid Light",
    "Linear Light",
    "Pin Light",
    "Hard Mix",
    '----',
    "Difference",
    "Exclusion",
    "Subtract",
    "Divide",
    "Negation",
    "Phoenix",
    "Glow",
    "Reflect"
];

var defaults = {
    blendMode: 'Normal',
    opacity: 1.0
};

var SceneControl = React.createClass({
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
        var display = this.props.display,
            obj = {};

        if (val === '----') return;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj);
        display.update(obj);
    },

    render: function() {
        var state = this.state;

        return (
            <div className="control">
                <div className="header">SCENE</div>
                <div className="row">
                    <label className="label">Blending</label>
                    <SelectInput
                        name="blendMode"
                        size="20"
                        items={blendModes}
                        value={this.state.blendMode}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        value={this.state.opacity}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.handleChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.handleChange}
                            />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = SceneControl;