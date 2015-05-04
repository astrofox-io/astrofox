'use strict';

var React = require('react');

var Splitter = React.createClass({
    defaultProps: {
        type: 'horizontal'
    },

    getDefaultProps: function() {
        return this.defaultProps;
    },

    handleMouseDown: function(e) {
        if (this.props.onDragStart) {
            this.props.onDragStart(e);
        }
    },

    render: function() {
        var classes = 'splitter splitter-' + this.props.type;

        return (
            <div
                className={classes}
                onMouseDown={this.handleMouseDown}>
                <i className="icon-dot-3" />
            </div>
        );
    }
});

module.exports = Splitter;