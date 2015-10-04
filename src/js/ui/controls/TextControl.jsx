'use strict';

var React = require('react');
var Application = require('core/Application.js');

var ColorInput = require('ui/inputs//ColorInput.jsx');
var NumberInput = require('ui/inputs//NumberInput.jsx');
var RangeInput = require('ui/inputs//RangeInput.jsx');
var SelectInput = require('ui/inputs//SelectInput.jsx');
var TextInput = require('ui/inputs//TextInput.jsx');
var ToggleInput = require('ui/inputs//ToggleInput.jsx');

var defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    x: 0,
    y: 0,
    color: '#FFFFFF',
    rotation: 0,
    opacity: 1.0
};

var TextControl = React.createClass({
    fontOptions: [
        'Abel',
        'Bangers',
        'Cardo',
        'Dynalight',
        'Merriweather',
        'Playfair Display',
        'Permanent Marker',
        'Oswald',
        'Oxygen',
        'Racing Sans One',
        'Raleway',
        'Roboto'
    ],

    getInitialState: function() {
        return defaults;
    },

    componentWillMount: function() {
        this.shouldUpdate = false;
    },

    componentDidMount: function() {
        var display = this.props.display;

        if (display.initialized) {
            display.render();

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
            display.render();
        });
    },

    getSelectItems: function() {
        return this.fontOptions.map(function(item) {
            return { name: item, value: item, style: { fontFamily: item } };
        });
    },

    render: function() {
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <div className="header">TEXT</div>
                <div className="row">
                    <label className="label">Text</label>
                    <TextInput
                        name="text"
                        size="20"
                        value={this.state.text}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Font</label>
                    <SelectInput
                        name="font"
                        size="20"
                        items={this.getSelectItems()}
                        value={this.state.font}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        min={0}
                        value={this.state.size}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Bold</label>
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.handleChange} />
                    <label className="label">Italic</label>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
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
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
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
                        min={-maxHeight}
                        max={maxHeight}
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
                    <label className="label">Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.handleChange} />
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

module.exports = TextControl;