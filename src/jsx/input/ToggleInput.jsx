'use strict';

var React = require('react');

var ToggleInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: "toggle",
            value: 0
        };
    },

    getInitialState: function() {
        return {
            value: this.props.value
        };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = (this.state.value + 1) % 2;

        this.setState({ value: val }, function(){
            if (this.props.onChange) {
                this.props.onChange(this.props.name, val);
            }
        }.bind(this));
    },

    render: function() {
        var classes = "input input-toggle";
        if (this.state.value == 1) classes += " input-toggle-on";

        return (
            <div className={classes} onClick={this.handleClick}></div>
        );
    }
});

module.exports = ToggleInput;