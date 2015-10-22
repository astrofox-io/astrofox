'use strict';

var React = require('react');
var THREE = require('three');

var NumberInput = require('ui/inputs/NumberInput.jsx');
var ToggleInput = require('ui/inputs/ToggleInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');
var SelectInput = require('ui/inputs/SelectInput.jsx');
var BlendModes = require('graphics/BlendModes.js');

var blendModes = [
    'None',
    'Normal',
    'Add',
    'Subtract',
    'Multiply',
    '----',
    //'Dissolve',
    'Darken',
    'Color Burn',
    'Linear Burn',
    //'Darker Color',
    '----',
    'Lighten',
    'Screen',
    'Color Dodge',
    'Linear Dodge',
    //'Lighter Color',
    '----',
    'Overlay',
    'Soft Light',
    'Hard Light',
    //'Vivid Light',
    'Linear Light',
    //'Pin Light',
    //'Hard Mix',
    '----',
    'Difference',
    'Exclusion',
    'Divide'
];

var SceneControl = React.createClass({
    getInitialState: function() {
        return {
            blending: 'Normal',
            opacity: 1.0
        };
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
                        name="blending"
                        size="20"
                        items={blendModes}
                        value={this.state.blending}
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