import { setActiveElementId, setActiveReactorId } from "@/app/actions/app";
import { addReactor } from "@/app/actions/reactors";
import { addScene } from "@/app/actions/scenes";
import { ButtonInput } from "@/app/components/inputs";
import LayersPanel from "@/app/components/panels/LayersPanel";
import PanelHeader from "@/app/components/panels/PanelHeader";
import ReactorsPanel from "@/app/components/panels/ReactorsPanel";
import { Plus } from "@/app/icons";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function LeftPanel() {
	async function handleAddScene() {
		const scene = await addScene();
		setActiveElementId(scene?.id);
	}

	function handleAddReactor() {
		const reactor = addReactor() as { id?: string } | undefined;
		setActiveReactorId(reactor?.id);
	}

	return (
		<div className="flex flex-col shrink-0 relative w-90 overflow-hidden border-r">
			<ResizablePanelGroup orientation="vertical">
				<ResizablePanel defaultSize={60} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden">
						<PanelHeader
							title="Layers"
							actions={
								<ButtonInput
									icon={Plus}
									title="Add Scene"
									onClick={handleAddScene}
								/>
							}
						/>
						<LayersPanel />
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={40} minSize="48px">
					<div className="flex flex-col h-full overflow-hidden bg-neutral-900">
						<PanelHeader
							title="Reactors"
							actions={
								<ButtonInput
									icon={Plus}
									title="Add Reactor"
									onClick={handleAddReactor}
								/>
							}
						/>
						<ReactorsPanel />
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
