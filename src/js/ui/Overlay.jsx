'use strict';

var React = require('react');

var Overlay = React.createClass({
    getDefaultProps: function() {
        return {
            visible: false
        }
    },

    render: function() {
        var classes = 'overlay';

        if (this.props.visible) {
            classes += ' overlay-active';
        }

        return (
            <div className={classes}>
                <div className="background" />
                <div className="content">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

module.exports = Overlay;