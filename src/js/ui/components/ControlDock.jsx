'use strict';

const React = require('react');
const Application = require('../../core/Application.js');
const Panel = require('../layout/Panel.jsx');
const PanelDock = require('../layout/PanelDock.jsx');
const ControlsPanel = require('./ControlsPanel.jsx');
const LayersPanel = require('./LayersPanel.jsx');
const autoBind = require('../../util/autoBind.js');

class ControlDock extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = { visible: true };
    }
    
    componentDidMount() {
        Application.on('control_added', obj => {
            let layers = this.refs.layers,
                controls = this.refs.controls;

            layers.updateLayers(() => {
                layers.setActiveLayer(obj);
            });

            controls.updateControls();
        });
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

    render() {
        let state = this.state;

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