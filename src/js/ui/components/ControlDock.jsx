'use strict';

var React = require('react');
var Application = require('../../core/Application.js');

var Panel = require('../layout/Panel.jsx');
var PanelDock = require('../layout/PanelDock.jsx');
var ControlsPanel = require('./ControlsPanel.jsx');
var LayersPanel = require('./LayersPanel.jsx');

var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true
        };
    },

    componentDidMount: function() {
        Application.on('control_added', function(obj) {
            var layers = this.refs.layers,
                controls = this.refs.controls;

            layers.updateLayers(function() {
                layers.setActiveLayer(obj);
            });

            controls.forceUpdate();
        }.bind(this));
    },

    handleLayerSelected: function(layer) {
        this.refs.controls.focusControl(layer);
    },

    handleLayerChanged: function(layer) {
        if (layer) {
            this.refs.controls.updateControl(layer);
        }
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
                    minHeight={100}
                    resizable={true}>
                    <LayersPanel
                        ref="layers"
                        onLayerSelected={this.handleLayerSelected}
                        onLayerChanged={this.handleLayerChanged}
                    />
                </Panel>
                <Panel
                    title="CONTROLS"
                    stretch={true}
                    shouldUpdate={false}>
                    <ControlsPanel ref="controls" />
                </Panel>
            </PanelDock>
        );
    }
});

module.exports = ControlDock;