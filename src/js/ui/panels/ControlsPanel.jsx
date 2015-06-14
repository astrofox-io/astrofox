'use strict';

var React = require('react');
var Application = require('core/Application.js');
var FX = require('FX.js');

var BarSpectrumControl = require('ui/controls/BarSpectrumControl.jsx');
var ImageControl = require('ui/controls/ImageControl.jsx');
var TextControl = require('ui/controls/TextControl.jsx');
var GeometryControl = require('ui/controls/GeometryControl.jsx');

var ControlsPanel = React.createClass({
    getInitialState: function() {
        return {
            controls: []
        };
    },

    componentWillMount: function() {
        this.updateControls();
    },

    updateControls: function(callback) {
        var controls = [];

        Application.stage.scenes.nodes.forEach(function(scene) {
            scene.displays.nodes.forEach(function(display) {
                controls.push(display);
            }, this);
        }, this);

        this.setState({ controls: controls }, callback);
    },

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
        else if (display instanceof FX.GeometryDisplay) {
            return GeometryControl;
        }

        return null;
    },

    scrollToControl: function(layer) {
        var id = layer.toString(),
            controls = React.findDOMNode(this.refs.controls),
            node = React.findDOMNode(this.refs[id]);

        if (node) {
            controls.scrollTop = node.offsetTop;
        }
    },

    render: function() {
        var displays = Application.stage.getDisplays();

        var controls = displays.map(function(display, index) {
            var id = display.toString(),
                Control = this.getControl(display);

            if (Control !== null) {
                return (
                    <Control
                        ref={id}
                        key={id}
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