'use strict';

var React = require('react');
var Application = require('../../core/Application.js');

var ColorInput = require('../input/ColorInput.jsx');
var NumberInput = require('../input/NumberInput.jsx');
var RangeInput = require('../input/RangeInput.jsx');
var SelectInput = require('../input/SelectInput.jsx');
var TextInput = require('../input/TextInput.jsx');
var ToggleInput = require('../input/ToggleInput.jsx');

var TextControl = React.createClass({
    defaultState: {
        text: '',
        size: 40,
        font: 'Arial',
        italic: false,
        bold: false,
        x: 0,
        y: 0,
        z: 0,
        color: '#FFFFFF',
        rotation: 0,
        opacity: 1.0
    },

    getInitialState: function() {
        return this.defaultState;
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
        var obj = {};

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, function() {
            var display = this.props.display;

            display.update(this.state);
        });
    },

    render: function() {
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <div className="header">3D CUBE</div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
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
                    <label className="label">Z</label>
                    <NumberInput
                        name="z"
                        size="3"
                        value={this.state.z}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.z}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = TextControl;