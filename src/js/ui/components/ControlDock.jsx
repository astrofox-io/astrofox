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
    }
    
    componentDidMount() {
        events.on('control-picked', this.onControlPicked, this);
        events.on('project-loaded', this.onProjectLoaded, this);
    }

    componentWillUnmount() {
        events.off('control-picked', this.onControlPicked, this);
        events.off('project-loaded', this.onProjectLoaded, this);
    }

    onControlPicked(newElement) {
        let obj, scene,
            layers = this.refs.layers,
            controls = this.refs.controls;

        scene = layers.getActiveScene();

        if (scene) {
            obj = new newElement();
            scene.addElement(obj);
        }

        layers.updateLayers(() => {
            layers.setActiveLayer(obj);
        });

        controls.updateControls();
    }

    onProjectLoaded() {
        let layers = this.refs.layers,
            controls = this.refs.controls;

        layers.updateLayers(() => {
            layers.setActiveIndex(0);
            controls.updateControls();
        });
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

    render() {
        return (
            <PanelDock id="control-dock" visible={this.props.visible}>
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
                    stretch={true}>
                    <ControlsPanel ref="controls" />
                </Panel>
            </PanelDock>
        );
    }
}