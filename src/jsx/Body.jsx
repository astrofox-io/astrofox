'use strict';

var React = require('react');

var Body = React.createClass({
    render: function() {
        return (
            <div id="body">
                {this.props.children}
            </div>
        );
    }
});

module.exports = Body;