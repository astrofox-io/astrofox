'use strict';

var React = require('react');
var Application = require('../../Application.js');
var FX = require('../../FX.js');

var BarSpectrumControl = require('../controls/BarSpectrumControl.jsx');
var ImageControl = require('../controls/ImageControl.jsx');
var TextControl = require('../controls/TextControl.jsx');

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
        React.findDOMNode(this.refs.controls).scrollTop = node.offsetTop;
    },

    render: function() {
        var controls = Application.displays.map(function(display, index) {
            var Control = this.getControl(display);

            return (
                <Control
                    ref={'ctrl' + index}
                    key={'ctrl' + display.toString()}
                    display={display}
                />
            );
        }, this);

        return (
            <div className="controls-panel" ref="controls">
                {controls}
            </div>
        );
    }
});

module.exports = ControlsPanel;