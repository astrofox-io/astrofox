'use strict';

var React = require('react');
var BarSpectrumControl = require('./controls/BarSpectrumControl.jsx');
var ImageControl = require('./controls/ImageControl.jsx');
var TextControl = require('./controls/TextControl.jsx');
var FX = require('../FX.js');

var ControlsPanel = React.createClass({
    getControl: function(display) {
        if (display instanceof FX.BarSpectrumDisplay) {
            return BarSpectrumControl;
        }
        else if (display instanceof FX.ImageDisplay) {
            return ImageControl;
        }
        else if (display instanceof FX.TextDisplay) {
            return TextControl;
        }
    },

    scrollToControl: function(index) {
        var node = React.findDOMNode(this.refs['ctrl' + index]);
        this.refs.controls.scrollTop = node.offsetTop;
    },

    render: function() {
        var controls = this.props.app.displays.map(function(display, index) {
            var Control = this.getControl(display);
            var props = {
                app: this.props.app,
                display: display,
                key: 'ctrl' + display.toString()
            };
            return <Control ref={'ctrl' + index} {...props} />;
        }, this);

        return (
            <div id="controls" ref="controls">
                {controls}
            </div>
        );
    }
});

module.exports = ControlsPanel;