import useApp from "@/view/actions/app";
import Panel from "@/view/components/layout/Panel";
import PanelDock from "@/view/components/layout/PanelDock";
import ControlsPanel from "@/view/components/panels/ControlsPanel";
import LayersPanel from "@/view/components/panels/LayersPanel";
import React from "react";

export default function ControlDock() {
	const showControlDock = useApp((state) => state.showControlDock);
	return (
		<PanelDock width={320} visible={showControlDock}>
			<Panel title="Layers" height={300} minHeight={100} resizable>
				<LayersPanel />
			</Panel>
			<Panel title="Controls" stretch>
				<ControlsPanel />
			</Panel>
		</PanelDock>
	);
}
