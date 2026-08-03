import {
  AudioLines,
  FilePlus2,
  FolderOpen,
  Image,
  type LucideIcon,
  Save,
  Settings2,
  Video,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { handleMenuAction } from '@/app/actions/app';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import menuConfig from '@/lib/config/menu.json';

type MenuAction =
  | 'new-project'
  | 'open-project'
  | 'save-project'
  | 'load-audio'
  | 'save-image'
  | 'save-video'
  | 'edit-canvas'
  | 'open-dev-tools';

type MenuEntry = {
  label?: string;
  action?: MenuAction;
  hidden?: boolean;
};

interface MenuSection {
  label: string;
  hidden?: boolean;
  submenu?: MenuEntry[];
}

interface SidebarItem {
  action: MenuAction;
  icon: LucideIcon;
}

const ACTION_ICONS: Record<MenuAction, LucideIcon> = {
  'new-project': FilePlus2,
  'open-project': FolderOpen,
  'save-project': Save,
  'load-audio': AudioLines,
  'save-image': Image,
  'save-video': Video,
  'edit-canvas': Settings2,
  'open-dev-tools': Settings2,
};

const ACTION_TRANSLATION_KEYS: Record<string, string> = {
  'new-project': 'new-project',
  'open-project': 'open-project',
  'save-project': 'save-project',
  'load-audio': 'load-audio',
  'save-image': 'save-image',
  'save-video': 'save-video',
  'edit-canvas': 'project-settings',
};

const typedMenuConfig = menuConfig as MenuSection[];

function getSidebarSections(): SidebarItem[][] {
  return typedMenuConfig
    .filter(section => !section.hidden && ['File', 'Edit'].includes(section.label))
    .map(section =>
      (section.submenu || [])
        .filter((item): item is MenuEntry & { label: string; action: MenuAction } =>
          Boolean(item.label && item.action && ACTION_ICONS[item.action]),
        )
        .map(item => ({
          action: item.action,
          icon: ACTION_ICONS[item.action],
        })),
    )
    .filter(section => section.length > 0);
}

export default function SidebarNav() {
  const { t } = useTranslation(undefined, { keyPrefix: 'menu' });
  const sections = getSidebarSections();

  return (
    <TooltipProvider>
      <aside className="flex w-14 shrink-0 self-stretch flex-col items-center border-r px-2 py-3">
        <div className="flex w-full flex-1 flex-col items-center gap-2">
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.map(item => item.action).join('-')}>
              {sectionIndex > 0 ? <div className="my-2 h-px w-8 bg-neutral-600" /> : null}
              {section.map(item => {
                const Icon = item.icon;

                return (
                  <Tooltip key={item.action}>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="w-full bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                          aria-label={
                            ACTION_TRANSLATION_KEYS[item.action]
                              ? t(ACTION_TRANSLATION_KEYS[item.action])
                              : item.action
                          }
                          onClick={() => handleMenuAction(item.action)}
                        />
                      }
                    >
                      <Icon size={18} />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
                    >
                      {ACTION_TRANSLATION_KEYS[item.action]
                        ? t(ACTION_TRANSLATION_KEYS[item.action])
                        : item.action}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
