import React from 'react';
import { useSelector } from 'react-redux';
import Panel from 'components/layout/Panel';
import PanelDock from 'components/layout/PanelDock';
import ControlsPanel from 'components/panels/ControlsPanel';
import LayersPanel from 'components/panels/LayersPanel';

export default function ControlDock() {
  const showControlDock = useSelector(state => state.app.showControlDock);
  return (
    <PanelDock visible={showControlDock}>
      <Panel title="Layers" height={300} minHeight={100} resizable>
        <LayersPanel />
      </Panel>
      <Panel title="Controls" stretch>
        <ControlsPanel />
      </Panel>
    </PanelDock>
  );
}
