'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var Application = require('core/Application.js');
var ControlLoader = require('util/ControlLoader.js');

var ControlsPanel = React.createClass({
    getInitialState: function() {
        return {
            controls: [],
            activeIndex: -1
        };
    },

    componentWillMount: function() {
        this.updateControls();
    },

    updateControls: function(callback) {
        var controls = [];

        Application.stage.scenes.nodes.forEach(function(scene) {
            controls.push(scene);
            scene.displays.nodes.forEach(function(display) {
                controls.push(display);
            }, this);
            scene.effects.nodes.forEach(function(effect) {
                controls.push(effect);
            }, this);
        }, this);

        this.setState({ controls: controls }, callback);
    },

    scrollToControl: function(layer) {
        var id = layer.toString(),
            node = ReactDOM.findDOMNode(this.refs[id]);

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
        }
    },

    render: function() {
        var displays = [];

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            displays.push(scene);
            scene.effects.nodes.reverse().forEach(function(effect) {
                displays.push(effect);
            }, this);
            scene.displays.nodes.reverse().forEach(function(display) {
                displays.push(display);
            }, this);
        }, this);

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