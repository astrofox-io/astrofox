'use strict';

var React = require('react');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');

var defaults = {
    angle: 90,
    scale: 1.0
};

var DotScreenControl = React.createClass({
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
                <div className="header">DOT SCREEN</div>
                <div className="row">
                    <label className="label">Amount</label>
                    <NumberInput
                        name="scale"
                        size="3"
                        value={this.state.scale}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={this.handleChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="scale"
                            min={0.0}
                            max={2.0}
                            step={0.01}
                            value={this.state.scale}
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

module.exports = DotScreenControl;