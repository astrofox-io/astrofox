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
        Events.on('layers-update', this.updateLayers);
        Events.on('project-loaded', this.onProjectLoaded);
    }

    componentWillUnmount() {
        Events.off('layers-update', this.updateLayers);
        Events.off('project-loaded', this.onProjectLoaded);
    }

    onLayerSelected(layer) {
        this.refs.controls.focusControl(layer);
    }

    onProjectLoaded() {
        this.updateLayers();
        this.refs.layers.setActiveIndex(0);
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

    toggleDock() {
        this.setState({ visible: !this.state.visible });
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