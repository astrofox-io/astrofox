'use strict';

var React = require('react');
var Application = require('core/Application.js');

var ColorInput = require('ui/inputs/ColorInput.jsx');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');
var SelectInput = require('ui/inputs/SelectInput.jsx');
var TextInput = require('ui/inputs/TextInput.jsx');
var ToggleInput = require('ui/inputs/ToggleInput.jsx');

var defaults = {
    shape: 'Box',
    shader: 'Normal',
    shading: 'Smooth',
    x: 0,
    y: 0,
    z: 0,
    wireframe: false,
    color: '#FFFFFF',
    opacity: 1.0,
    lightIntensity: 1.0,
    lightDistance: 500
};

var shapes = [
    'Box',
    'Sphere',
    'Dodecahedron',
    'Icosahedron',
    'Octahedron',
    'Tetrahedron',
    'Torus',
    'Torus Knot'
];

var shaders = [
    'Normal',
    'Basic',
    'Lambert',
    'Phong',
    'Depth'
];

var shading = [
    'Smooth',
    'Flat'
];

var GeometryControl = React.createClass({
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
                        items={shapes}
                        value={this.state.shape}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Shader</label>
                    <SelectInput
                        name="shader"
                        size="20"
                        items={shaders}
                        value={this.state.shader}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Shading</label>
                    <SelectInput
                        name="shading"
                        size="20"
                        items={shading}
                        value={this.state.shading}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Wireframe</label>
                    <ToggleInput
                        name="wireframe"
                        value={this.state.wireframe}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={this.state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.x}
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
                        value={this.state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.y}
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
                        value={this.state.z}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.z}
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
                        step={0.1}
                        value={this.state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1}
                            step={0.1}
                            value={this.state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Light Distance</label>
                    <NumberInput
                        name="lightDistance"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={this.state.lightDistance}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="lightDistance"
                            min={-maxVal}
                            max={maxVal}
                            value={this.state.lightDistance}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Light Intensity</label>
                    <NumberInput
                        name="lightIntensity"
                        size="3"
                        min={0}
                        max={10.0}
                        step={0.1}
                        value={this.state.lightIntensity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="lightIntensity"
                            min={0}
                            max={10.0}
                            step={0.1}
                            value={this.state.lightIntensity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = GeometryControl;