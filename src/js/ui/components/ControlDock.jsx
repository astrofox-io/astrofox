import React from 'react';

import UIComponent from '../UIComponent';
import { events } from '../../core/Global';

import Panel from '../layout/Panel';
import PanelDock from '../layout/PanelDock';
import ControlsPanel from './ControlsPanel';
import LayersPanel from './LayersPanel';

export default class ControlDock extends UIComponent {
    constructor(props) {
        super(props);

        this.state = { visible: true };
    }
    
    componentDidMount() {
        events.on('layers-update', this.updateLayers);
        events.on('project-loaded', this.onProjectLoaded);
    }

    componentWillUnmount() {
        events.off('layers-update', this.updateLayers);
        events.off('project-loaded', this.onProjectLoaded);
    }

    onProjectLoaded() {
        this.updateLayers();
        this.refs.layers.setActiveIndex(0);
    }

    onLayerSelected(layer, index) {
        if (layer) {
            this.refs.controls.focusControl(layer, index);
        }
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