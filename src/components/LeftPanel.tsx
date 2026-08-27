import { useTranslation } from 'react-i18next';
import { setActiveElementId, setActiveReactorId } from '@/app/actions/app';
import { addReactor } from '@/app/actions/reactors';
import { addScene } from '@/app/actions/scenes';
import { Plus } from '@/app/icons';
import LayersPanel from '@/components/LayersPanel';
import PanelHeader from '@/components/PanelHeader';
import ReactorsPanel from '@/components/ReactorsPanel';
import SidebarNav from '@/components/SidebarNav';
import { Button } from '@/components/ui/button';
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t('add-scene')}
                            className="bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                            onClick={handleAddScene}
                          />
                        }
                      >
                        <Plus className="size-4 text-neutral-100" />
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                            onClick={handleAddReactor}
                            aria-label={t('add-reactor')}
                          />
                        }
                      >
                        <Plus className="size-4 text-neutral-100" />
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
