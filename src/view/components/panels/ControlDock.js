import React from 'react';
import Panel from 'components/layout/Panel';
import PanelDock from 'components/layout/PanelDock';
import ControlsPanel from 'components/panels/ControlsPanel';
import LayersPanel from 'components/panels/LayersPanel';

export default function ControlDock({ visible }) {
  return (
    <PanelDock visible={visible}>
      <Panel title="Layers" height={300} minHeight={100} resizable>
        <LayersPanel />
      </Panel>
      <Panel title="Controls" stretch>
        <ControlsPanel />
      </Panel>
    </PanelDock>
  );
}
