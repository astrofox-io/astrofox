'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Application = require('../../core/Application.js');
var ControlLoader = require('../../util/ControlLoader.js');

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

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            controls.push(scene);
            scene.effects.nodes.reverse().forEach(function(effect) {
                controls.push(effect);
            }, this);
            scene.displays.nodes.reverse().forEach(function(display) {
                controls.push(display);
            }, this);
        }, this);

        this.setState({ controls: controls }, callback);
    },

    updateControl: function(layer) {
        var id = layer.toString(),
            control = this.refs[id];

        if (control) {
            this.refs[id].setState(layer.options);
        }
    },

    focusControl: function(layer) {
        var id = layer.toString(),
            node = ReactDOM.findDOMNode(this.refs[id]);

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
        }
    },

    render: function() {
        var controls = this.state.controls.map(function(display) {
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