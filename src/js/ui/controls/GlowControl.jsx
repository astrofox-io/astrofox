'use strict';

var React = require('react');
var NumberInput = require('../inputs/NumberInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');

var defaults = {
    amount: 0.1,
    intensity: 1
};

var GLOW_MAX = 50;

var GlowControl = React.createClass({
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
                <div className="header">GLOW</div>
                <div className="row">
                    <label className="label">Amount</label>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            step={0.01}
                            max={1}
                            value={this.state.amount}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Intensity</label>
                    <NumberInput
                        name="intensity"
                        size="3"
                        value={this.state.intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="intensity"
                            min={1}
                            step={0.01}
                            max={3}
                            value={this.state.intensity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = GlowControl;