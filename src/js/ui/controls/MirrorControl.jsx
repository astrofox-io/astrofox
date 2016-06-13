'use strict';

var React = require('react');
var NumberInput = require('../inputs/NumberInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');

var defaults = {
    side: 1
};

var MirrorControl = React.createClass({
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
            display.update(obj);
        });
    },

    render: function() {
        return (
            <div className="control">
                <div className="header">MIRROR</div>
                <div className="row">
                    <label className="label">Side</label>
                    <NumberInput
                        name="side"
                        size="3"
                        value={this.state.side}
                        min={0}
                        max={3}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="side"
                            min={0}
                            max={3}
                            value={this.state.side}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = MirrorControl;