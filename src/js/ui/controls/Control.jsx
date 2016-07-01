'use strict';

const React = require('react');

const Control = React.createClass({
    getDefaultProps: function() {
        return {
            inputs: []
        }
    },

    render: function() {
        let inputs = this.props.inputs.map(function(input) {
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