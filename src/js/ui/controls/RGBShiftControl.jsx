'use strict';

var React = require('react');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');

var defaults = {
    amount: 0.005,
    angle: 0.0
};

var RADIANS = 0.017453292519943295;

var RGBShiftControl = React.createClass({
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
                <div className="header">RGB SHIFT</div>
                <div className="row">
                    <label className="label">Amount</label>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.001}
                        onChange={this.handleChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0.0}
                            max={1.0}
                            step={0.001}
                            value={this.state.amount}
                            onChange={this.handleChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Angle</label>
                    <NumberInput
                        name="angle"
                        size="3"
                        value={this.state.angle}
                        min={0}
                        max={360}
                        onChange={this.handleChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="angle"
                            min={0}
                            max={360}
                            value={this.state.angle}
                            onChange={this.handleChange}
                            />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = RGBShiftControl;