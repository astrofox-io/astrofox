import React from 'react';

import UIComponent from '../UIComponent';
import Panel from '../layout/Panel';
import PanelDock from '../layout/PanelDock';
import ControlsPanel from './ControlsPanel';
import LayersPanel from './LayersPanel';

export default class ControlDock extends UIComponent {
    constructor(props) {
        super(props);
    }

    onLayerSelected(index) {
        this.controls.focusControl(index);
    }

    onLayerUpdate(display) {
        this.controls.updateControl(display);
    }

    updateControls(newState) {
        this.controls.updateState(newState);
    }

    render() {
        return (
            <PanelDock id="control-dock" visible={this.props.visible}>
                <Panel
                    title="LAYERS"
                    height={300}
                    minHeight={100}
                    resizable={true}>
                    <LayersPanel
                        onLayerSelected={this.onLayerSelected}
                        onLayerUpdate={this.onLayerUpdate}
                        onChange={this.updateControls}
                    />
                </Panel>
                <Panel
                    title="CONTROLS"
                    stretch={true}>
                    <ControlsPanel
                        ref={el => this.controls = el}
                    />
                </Panel>
            </PanelDock>
        );
    }
}