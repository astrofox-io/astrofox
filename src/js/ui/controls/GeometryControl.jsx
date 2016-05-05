'use strict';

var React = require('react');

var ColorInput = require('../inputs/ColorInput.jsx');
var NumberInput = require('../inputs/NumberInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');
var SelectInput = require('../inputs/SelectInput.jsx');
var TextInput = require('../inputs/TextInput.jsx');
var ToggleInput = require('../inputs/ToggleInput.jsx');

var config = require('../../props/Geometry.json');

var GeometryControl = React.createClass({
    getInitialState: function() {
        return config.options;
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
        var maxVal = 500;

        return (
            <div className="control">
                <div className="header">3D GEOMETRY</div>
                <div className="row">
                    <label className="label">Shape</label>
                    <SelectInput
                        name="shape"
                        size="20"
                        items={config.shapes}
                        value={state.shape}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Material</label>
                    <SelectInput
                        name="material"
                        size="20"
                        items={config.materials}
                        value={state.material}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Shading</label>
                    <SelectInput
                        name="shading"
                        size="20"
                        items={config.shading}
                        value={state.shading}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Wireframe</label>
                    <ToggleInput
                        name="wireframe"
                        value={state.wireframe}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Edges</label>
                    <ToggleInput
                        name="edges"
                        value={state.edges}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Edge Color</label>
                    <ColorInput
                        name="edgeColor"
                        value={state.edgeColor}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxVal}
                            max={maxVal}
                            value={state.x}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxVal}
                            max={maxVal}
                            value={state.y}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Z</label>
                    <NumberInput
                        name="z"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.z}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-maxVal}
                            max={maxVal}
                            value={state.z}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = GeometryControl;