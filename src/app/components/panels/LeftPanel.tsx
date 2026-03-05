import { setActiveElementId, setActiveReactorId } from "@/app/actions/app";
import { addReactor } from "@/app/actions/reactors";
import { addScene } from "@/app/actions/scenes";
import LayersPanel from "@/app/components/panels/LayersPanel";
import PanelHeader from "@/app/components/panels/PanelHeader";
import ReactorsPanel from "@/app/components/panels/ReactorsPanel";
import { Plus } from "@/app/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <ResizablePanel defaultSize={60} minSize="40px">
          <div className="flex flex-col h-full overflow-hidden">
            <PanelHeader
              title="Layers"
              actions={
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div
                          className="text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-neutral-800"
                          onClick={handleAddScene}
                        />
                      }
                    >
                      <Plus className="text-neutral-100 w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={6}
                      className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
                    >
                      Add scene
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              }
            />
            <LayersPanel />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize="40px">
          <div className="flex flex-col h-full overflow-hidden bg-neutral-900">
            <PanelHeader
              title="Reactors"
              actions={
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div
                          className="text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-neutral-800"
                          onClick={handleAddReactor}
                        />
                      }
                    >
                      <Plus className="text-neutral-100 w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={6}
                      className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
                    >
                      Add reactor
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              }
            />
            <ReactorsPanel />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
