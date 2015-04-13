'use strict';

var React = require('react');

var ColorPicker = React.createClass({
    render: function() {
        return (
            <div>
                <canvas ref="canvas" />
            </div>
        );
    }
});

module.exports = ColorPicker;