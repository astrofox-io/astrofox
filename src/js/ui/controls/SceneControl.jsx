'use strict';

var React = require('react');
var THREE = require('three');

var NumberInput = require('ui/inputs/NumberInput.jsx');
var ToggleInput = require('ui/inputs/ToggleInput.jsx');
var SelectInput = require('ui/inputs/SelectInput.jsx');

var blendModes = [
    'None', 'Normal', 'Add', 'Subtract'
];

var SceneControl = React.createClass({
    getInitialState: function() {
        return {
            'blending': 'Normal'
        };
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
        var display = this.props.display,
            obj = {};

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj);
        display.update(obj);
    },

    render: function() {
        var state = this.state;

        return (
            <div className="control">
                <div className="header">SCENE</div>
                <div className="row">
                    <label className="label">Blending</label>
                    <SelectInput
                        name="blending"
                        size="20"
                        items={blendModes}
                        value={this.state.blending}
                        onChange={this.handleChange} />
                </div>
            </div>
        );
    }
});

module.exports = SceneControl;