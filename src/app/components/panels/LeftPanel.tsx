import { useTranslation } from 'react-i18next';
import { setActiveElementId, setActiveReactorId } from '@/app/actions/app';
import { addReactor } from '@/app/actions/reactors';
import { addScene } from '@/app/actions/scenes';
import SidebarNav from '@/app/components/nav/SidebarNav';
import LayersPanel from '@/app/components/panels/LayersPanel';
import PanelHeader from '@/app/components/panels/PanelHeader';
import ReactorsPanel from '@/app/components/panels/ReactorsPanel';
import { Plus } from '@/app/icons';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function LeftPanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'panels' });

  async function handleAddScene() {
    const scene = await addScene();
    setActiveElementId(scene?.id);
  }

  function handleAddReactor() {
    const reactor = addReactor() as { id?: string } | undefined;
    setActiveReactorId(reactor?.id);
  }

  return (
    <div className="flex shrink-0 relative w-90 overflow-hidden border-r">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={60} minSize="40px">
            <div className="flex flex-col h-full overflow-hidden">
              <PanelHeader
                title={t('layers')}
                actions={
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
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
                        {t('add-scene')}
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
                title={t('reactors')}
                actions={
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-neutral-800"
                            onClick={handleAddReactor}
                            aria-label={t('add-reactor')}
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
                        {t('add-reactor')}
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
    </div>
  );
}
