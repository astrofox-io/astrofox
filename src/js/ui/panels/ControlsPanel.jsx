'use strict';

var React = require('react');
var Application = require('../../Application.js');
var FX = require('../../FX.js');

var BarSpectrumControl = require('../controls/BarSpectrumControl.jsx');
var ImageControl = require('../controls/ImageControl.jsx');
var TextControl = require('../controls/TextControl.jsx');
var CubeControl = require('../controls/CubeControl.jsx');

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
        else if (display instanceof FX.CubeDisplay) {
            return CubeControl;
        }

        return null;
    },

    scrollToControl: function(index) {
        var controls = React.findDOMNode(this.refs.controls),
            node = React.findDOMNode(this.refs['ctrl' + index]);

        if (node) {
            controls.scrollTop = node.offsetTop;
        }
    },

    render: function() {
        var controls = Application.displays.map(function(display, index) {
            var Control = this.getControl(display);

            if (Control !== null) {
                return (
                    <Control
                        ref={'ctrl' + index}
                        key={display.toString()}
                        display={display}
                        />
                );
            }
        }, this);

        return (
            <div className="controls-panel" ref="controls">
                {controls}
            </div>
        );
    }
});

module.exports = ControlsPanel;