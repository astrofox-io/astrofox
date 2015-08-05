'use strict';

var React = require('react');
var NumberInput = require('ui/inputs/NumberInput.jsx');
var RangeInput = require('ui/inputs/RangeInput.jsx');

var defaults = {
    h: 1,
    v: 1
};

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
                    <label className="label">Horizontal</label>
                    <NumberInput
                        name="h"
                        size="3"
                        value={this.state.h}
                        min={0}
                        max={10}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="h"
                            min={0}
                            max={10}
                            value={this.state.h}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Vertical</label>
                    <NumberInput
                        name="v"
                        size="3"
                        value={this.state.v}
                        min={0}
                        max={10}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="v"
                            min={0}
                            max={10}
                            value={this.state.v}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BlurControl;