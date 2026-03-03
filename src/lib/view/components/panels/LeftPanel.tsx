import Icon from "@/lib/view/components/interface/Icon";
import LayersPanel from "@/lib/view/components/panels/LayersPanel";
import PanelHeader from "@/lib/view/components/panels/PanelHeader";
import ReactorsPanel from "@/lib/view/components/panels/ReactorsPanel";
import { DotsHorizontal } from "@/lib/view/icons";
import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

export default function LeftPanel() {
	return (
		<div className="flex flex-col shrink-0 relative w-90 overflow-hidden border-r">
			<Group orientation="vertical">
				<Panel defaultSize={60} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden">
						<PanelHeader title="Layers" />
						<LayersPanel />
					</div>
				</Panel>
				<Separator className="flex items-center justify-center h-3 shrink-0 cursor-row-resize bg-neutral-800 outline-none">
					<Icon className="w-3 h-3 text-neutral-500" glyph={DotsHorizontal} />
				</Separator>
				<Panel defaultSize={40} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden bg-neutral-900">
						<PanelHeader title="Reactors" />
						<ReactorsPanel />
					</div>
				</Panel>
			</Group>
		</div>
	);
}
