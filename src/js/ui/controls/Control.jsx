'use strict';

var React = require('react');

var Control = React.createClass({
    getDefaultProps: function() {
        return {
            inputs: []
        }
    },

    render: function() {
        var inputs = this.props.inputs.map(function(input) {
            return (
                <div className="row">

                </div>
            );
        });

        return (
            <div className="control">
                <div className="header">{this.props.title}</div>
                {inputs}
            </div>
        );
    }
});

module.exports = Control;