'use strict';

var React = require('react');

var EmptyControl = React.createClass({
    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <div className="control">
                <div className="header">CONTROL</div>
                <div className="row">
                </div>
            </div>
        );
    }
});

module.exports = EmptyControl;