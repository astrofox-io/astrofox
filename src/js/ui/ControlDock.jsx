'use strict';

var React = require('react');
var Application = require('../Application.js');

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
        Application.on('displays_updated', function() {
            Application.resetScene();
            this.refs.layers.forceUpdate();
            this.refs.controls.forceUpdate();
        }.bind(this));
    },

    handleLayerSelected: function(index) {
        this.refs.controls.scrollToControl(index);
    },

    handleLayerChanged: function() {
        Application.resetScene();
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
                    height={200}
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