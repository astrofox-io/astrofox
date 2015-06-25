'use strict';

var React = require('react');
var Application = require('../core/Application.js');

var Panel = require('./panels/Panel.jsx');
var PanelDock = require('./panels/PanelDock.jsx');
var ControlsPanel = require('./panels/ControlsPanel.jsx');
var LayersPanel = require('./panels/LayersPanel.jsx');

var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true
        };
    },

    componentDidMount: function() {
        Application.on('control_added', function(control) {
            var layers = this.refs.layers,
                controls = this.refs.controls;

            layers.updateLayers(function() {
                layers.setActiveLayer(control);
            });

            controls.forceUpdate();
        }.bind(this));
    },

    handleLayerSelected: function(layer) {
        this.refs.controls.scrollToControl(layer);
    },

    handleLayerChanged: function() {
        this.refs.controls.forceUpdate();
    },

    showDock: function(val) {
        this.setState({ visible: val });
    },

    render: function() {
        var state = this.state;

        return (
            <PanelDock visible={state.visible}>
                <Panel
                    title="LAYERS"
                    ref="layersPanel"
                    height={300}
                    resizable={true}>
                    <LayersPanel
                        ref="layers"
                        onLayerSelected={this.handleLayerSelected}
                        onLayerChanged={this.handleLayerChanged}
                    />
                </Panel>
                <Panel
                    title="CONTROLS"
                    className="flex"
                    shouldUpdate={false}>
                    <ControlsPanel ref="controls" />
                </Panel>
            </PanelDock>
        );
    }
});

module.exports = ControlDock;