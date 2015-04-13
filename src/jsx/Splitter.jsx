'use strict';

var React = require('react');

var Splitter = React.createClass({
    defaultProps: {
        type: 'horizontal'
    },

    getDefaultProps: function() {
        return this.defaultProps;
    },

    startDrag: function(e) {
        this.props.onStartDrag(e);
    },

    render: function() {
        var classes = 'splitter splitter-' + this.props.type;

        return (
            <div
                className={classes}
                onMouseDown={this.startDrag}>
                <i className="icon-dot-3" />
            </div>
        );
    }
});

module.exports = Splitter;