'use strict';

var React = require('react');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');

var defaults = {
    scale: 10.0,
    center: 0.5
};

var HexagonControl = React.createClass({
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
                <div className="header">Hexagon</div>
                <div className="row">
                    <label className="label">Scale</label>
                    <NumberInput
                        name="scale"
                        size="3"
                        value={this.state.scale}
                        min={1}
                        max={100}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="scale"
                            min={1}
                            max={100}
                            value={this.state.scale}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Center</label>
                    <NumberInput
                        name="center"
                        size="3"
                        value={this.state.center}
                        min={0}
                        max={10}
                        step={0.01}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="center"
                            min={0}
                            max={10}
                            step={0.01}
                            value={this.state.center}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = HexagonControl;