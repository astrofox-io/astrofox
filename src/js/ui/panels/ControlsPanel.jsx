'use strict';

var React = require('react');
var _ = require('lodash');
var Application = require('core/Application.js');
var ControlLoader = require('util/ControlLoader.js');

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

    scrollToControl: function(layer) {
        var id = layer.toString(),
            controls = React.findDOMNode(this.refs.controls),
            node = React.findDOMNode(this.refs[id]);

        if (node) {
            controls.scrollTop = node.offsetTop;
        }
    },

    render: function() {
        var displays = Application.stage.getDisplays().reverse();

        var controls = displays.map(function(display) {
            var id = display.toString(),
                Control = ControlLoader.getControl(display) || 'div';

            return (
                <Control
                    ref={id}
                    key={id}
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