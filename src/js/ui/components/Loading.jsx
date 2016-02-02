'use strict';

var React = require('react');

var Loading = React.createClass({
    getDefaultProps: function() {
        return { visible: false };
    },

    render: function() {
        var classes = 'loading';

        if (this.props.visible) {
            classes += ' loading-active';
        }

        return (
            <div className={classes}></div>
        );
    }
});

module.exports = Loading;