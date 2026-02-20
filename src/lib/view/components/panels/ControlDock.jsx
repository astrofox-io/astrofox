import Panel from "@/lib/view/components/layout/Panel";
import PanelDock from "@/lib/view/components/layout/PanelDock";
import ControlsPanel from "@/lib/view/components/panels/ControlsPanel";
import LayersPanel from "@/lib/view/components/panels/LayersPanel";
import React from "react";

export default function ControlDock() {
	return (
		<PanelDock width={320} visible>
			<Panel title="Layers" height={300} minHeight={100} resizable>
				<LayersPanel />
			</Panel>
			<Panel title="Controls" stretch>
				<ControlsPanel />
			</Panel>
		</PanelDock>
	);
}
