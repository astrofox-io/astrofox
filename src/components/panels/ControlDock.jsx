import React, { PureComponent } from 'react';
import Panel from 'components/layout/Panel';
import PanelDock from 'components/layout/PanelDock';
import ControlsPanel from 'components/panels/ControlsPanel';
import LayersPanel from 'components/panels/LayersPanel';

export default class ControlDock extends PureComponent {
    handleLayerSelected = (index) => {
        this.controls.focusControl(index);
    }

    handleLayerUpdate = (display) => {
        this.controls.updateControl(display);
    }

    updateControls = (newState) => {
        this.controls.updateState(newState);
    }

    render() {
        const { visible } = this.props;

        return (
            <PanelDock visible={visible}>
                <Panel
                    title="Layers"
                    height={300}
                    minHeight={100}
                    resizable
                >
                    <LayersPanel
                        onLayerSelected={this.handleLayerSelected}
                        onLayerUpdate={this.handleLayerUpdate}
                        onChange={this.updateControls}
                    />
                </Panel>
                <Panel
                    title="Controls"
                    stretch
                >
                    <ControlsPanel
                        ref={e => (this.controls = e)}
                    />
                </Panel>
            </PanelDock>
        );
    }
}
