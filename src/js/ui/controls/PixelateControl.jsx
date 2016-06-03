'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');

const defaults = {
    type: 'Square',
    size: 10
};

const types = [
    'Square',
    'Hexagon'
];

const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 240;

var PixelateControl = React.createClass({
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

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, function() {
            display.update(this.state);
        });
    },

    render: function() {
        return (
            <div className="control">
                <div className="header">PIXELATE</div>
                <div className="row">
                    <label className="label">Type</label>
                    <SelectInput
                        name="type"
                        size="20"
                        items={types}
                        value={this.state.type}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={MIN_PIXEL_SIZE}
                            max={MAX_PIXEL_SIZE}
                            value={this.state.size}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PixelateControl;