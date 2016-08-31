'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { Events } = require('../../core/Global');

const Panel = require('../layout/Panel.jsx');
const PanelDock = require('../layout/PanelDock.jsx');
const ControlsPanel = require('./ControlsPanel.jsx');
const LayersPanel = require('./LayersPanel.jsx');

class ControlDock extends UIComponent {
    constructor(props) {
        super(props);

        this.state = { visible: true };
    }
    
    componentDidMount() {
        Events.on('layers_update', this.updateLayers);
    }

    componentWillUnmount() {
        Events.off('layers_update', this.updateLayers);
    }

    onLayerSelected(layer) {
        this.refs.controls.focusControl(layer);
    }

    onLayerChanged(layer) {
        if (layer) {
            this.refs.controls.updateControl(layer);
        }
    }

    onLayerAdded() {
        this.refs.controls.updateControls();
    }

    onLayerRemoved() {
        this.refs.controls.updateControls();
    }

    onLayerMoved() {
        this.refs.controls.updateControls();
    }

    showDock(val) {
        this.setState({ visible: val });
    }

    updateLayers(obj) {
        let layers = this.refs.layers,
            controls = this.refs.controls;

        layers.updateLayers(() => {
            layers.setActiveLayer(obj);
        });

        controls.updateControls();
    }

    render() {
        let state = this.state;

        return (
            <PanelDock id="control-dock" visible={state.visible}>
                <Panel
                    title="LAYERS"
                    ref="layersPanel"
                    height={300}
                    minHeight={100}
                    resizable={true}>
                    <LayersPanel
                        ref="layers"
                        onLayerSelected={this.onLayerSelected}
                        onLayerChanged={this.onLayerChanged}
                        onLayerAdded={this.onLayerAdded}
                        onLayerRemoved={this.onLayerRemoved}
                        onLayerMoved={this.onLayerMoved}
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
}

module.exports = ControlDock;