import React, { PureComponent } from 'react';
import Panel from 'components/layout/Panel';
import PanelDock from 'components/layout/PanelDock';
import ControlsPanel from 'components/panels/ControlsPanel';
import LayersPanel from 'components/panels/LayersPanel';

export default class ControlDock extends PureComponent {
    onLayerSelected = (index) => {
        this.controls.focusControl(index);
    };

    onLayerUpdate = (display) => {
        this.controls.updateControl(display);
    };

    updateControls = (newState) => {
        this.controls.updateState(newState);
    };

    render() {
        const { visible } = this.props;

        return (
            <PanelDock visible={visible}>
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
                        ref={e => this.controls = e}
                    />
                </Panel>
            </PanelDock>
        );
    }
}