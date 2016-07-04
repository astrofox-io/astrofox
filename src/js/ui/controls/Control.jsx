'use strict';

const React = require('react');

const Control = React.createClass({
    getDefaultProps: () => {
        return {
            inputs: []
        }
    },

    render: () => {
        let inputs = this.props.inputs.map(input => {
            return (
                <div className="row">
                    {input}
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