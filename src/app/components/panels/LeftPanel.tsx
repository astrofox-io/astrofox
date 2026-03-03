import LayersPanel from "@/app/components/panels/LayersPanel";
import PanelHeader from "@/app/components/panels/PanelHeader";
import ReactorsPanel from "@/app/components/panels/ReactorsPanel";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function LeftPanel() {
	return (
		<div className="flex flex-col shrink-0 relative w-90 overflow-hidden border-r">
			<ResizablePanelGroup orientation="vertical">
				<ResizablePanel defaultSize={60} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden">
						<PanelHeader title="Layers" />
						<LayersPanel />
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={40} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden bg-neutral-900">
						<PanelHeader title="Reactors" />
						<ReactorsPanel />
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
