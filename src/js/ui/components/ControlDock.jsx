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
        Application.on('control_added', function(obj) {
            let layers = this.refs.layers,
                controls = this.refs.controls;

            layers.updateLayers(function() {
                layers.setActiveLayer(obj);
            });

            controls.updateControls();
        }.bind(this));
    }

    handleLayerSelected(layer) {
        this.refs.controls.focusControl(layer);
    }

    handleLayerChanged(layer) {
        if (layer) {
            this.refs.controls.updateControl(layer);
        }
    }

    handleLayerAdded() {
        this.refs.controls.updateControls();
    }

    handleLayerRemoved() {
        this.refs.controls.updateControls();
    }

    handleLayerMoved() {
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
                        onLayerSelected={this.handleLayerSelected}
                        onLayerChanged={this.handleLayerChanged}
                        onLayerAdded={this.handleLayerAdded}
                        onLayerRemoved={this.handleLayerRemoved}
                        onLayerMoved={this.handleLayerMoved}
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