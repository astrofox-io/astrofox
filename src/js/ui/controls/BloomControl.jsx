'use strict';

var React = require('react');
var NumberInput = require('../inputs/NumberInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');
var SelectInput = require('../inputs/SelectInput.jsx');

var defaults = {
    blendMode: 'Screen',
    amount: 0.1,
    threshold: 1.0
};

var blendModes = [
    'Add',
    'Screen'
];

var BloomControl = React.createClass({
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
                <div className="header">BLOOM</div>
                <div className="row">
                    <label className="label">Blend Mode</label>
                    <SelectInput
                        name="blendMode"
                        size="20"
                        items={blendModes}
                        value={this.state.blendMode}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Amount</label>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.amount}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Threshold</label>
                    <NumberInput
                        name="threshold"
                        size="3"
                        value={this.state.threshold}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="threshold"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.threshold}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BloomControl;