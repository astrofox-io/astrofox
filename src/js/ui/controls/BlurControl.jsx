'use strict';

var React = require('react');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');
var SelectInput = require('ui/inputs/SelectInput.jsx');

var defaults = {
    type: 'Box',
    amount: 1.0
};

var types = [
    'Box',
    'Gaussian',
    'Zoom'
];

var BlurControl = React.createClass({
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
                <div className="header">BLUR</div>
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
                    <label className="label">Amount</label>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={10}
                        step={0.05}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={10}
                            step={0.05}
                            value={this.state.amount}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BlurControl;