import { clsx as classNames } from 'cnfast';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, TrashEmpty } from '@/app/icons';
import TextInput from '@/components/TextInput';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LayerProps {
  id: string;
  name?: string;
  displayName?: React.ReactNode;
  icon?: LucideIcon | null;
  className?: string;
  active?: boolean;
  dragging?: boolean;
  dragOver?: boolean;
  enabled?: boolean;
  onLayerClick?: (id: string) => void;
  onLayerUpdate?: (id: string, prop: string, value: unknown) => void;
  onLayerDelete?: ((id: string) => void) | null;
  onLayerDragStart?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDragOver?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDrop?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onLayerDragEnd?: () => void;
}

export default function Layer({
  id,
  name = '',
  displayName,
  icon = null,
  className,
  active = false,
  dragging = false,
  dragOver = false,
  enabled = true,
  onLayerClick,
  onLayerUpdate,
  onLayerDelete = null,
  onLayerDragStart,
  onLayerDragOver,
  onLayerDrop,
  onLayerDragEnd,
}: LayerProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const [edit, setEdit] = useState(false);
  const LayerIcon = icon;

  function createDragPreview(source: HTMLDivElement) {
    if (typeof document === 'undefined') {
      return null;
    }

    const preview = source.cloneNode(true) as HTMLDivElement;
    preview.style.position = 'fixed';
    preview.style.top = '-1000px';
    preview.style.left = '-1000px';
    preview.style.width = `${source.offsetWidth}px`;
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '9999';
    preview.style.opacity = '0.92';
    preview.style.transform = 'rotate(1deg)';
    document.body.appendChild(preview);

    window.setTimeout(() => {
      preview.remove();
    }, 0);

    return preview;
  }

  function handleLayerClick() {
    onLayerClick?.(id);
  }

  function handleEnableClick() {
    onLayerUpdate?.(id, 'enabled', !enabled);
  }

  function handleNameChange(name: string, val: string) {
    if (val.length > 0) {
      onLayerUpdate?.(id, name, val);
    }
    setEdit(false);
  }

  function handleEnableEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEdit(true);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onLayerDelete) {
      onLayerDelete(id);
    }
  }

  return (
    <div
      role="option"
      aria-selected={active}
      tabIndex={0}
      draggable={!edit}
      className={classNames(
        className,
        'group flex flex-row items-center text-sm text-neutral-300 hover:text-neutral-100 bg-neutral-800 px-2 py-1 relative cursor-default gap-2',
        {
          'bg-neutral-800': edit,
          'bg-primary': active && !edit,
          'opacity-25': dragging && !edit,
          'ring-1 ring-primary': dragOver && !edit,
        },
      )}
      onClick={handleLayerClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleLayerClick();
        }
      }}
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        const preview = createDragPreview(e.currentTarget);
        if (preview) {
          e.dataTransfer.setDragImage(preview, 16, 12);
        }
        onLayerDragStart?.(id, e);
      }}
      onDragOver={e => onLayerDragOver?.(id, e)}
      onDrop={e => onLayerDrop?.(id, e)}
      onDragEnd={onLayerDragEnd}
    >
      {LayerIcon && <LayerIcon className={'w-4 h-4'} />}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Double-clicking this label enters inline rename mode. */}
      <div className={'flex-1 min-w-0 py-0.5'} onDoubleClick={handleEnableEdit}>
        {edit ? (
          <TextInput
            name="displayName"
            value={name}
            className={'h-7 !px-2 !leading-7 !rounded !bg-neutral-800 !border-primary'}
            buffered
            autoFocus
            autoSelect
            onChange={handleNameChange}
          />
        ) : (
          (displayName ?? name)
        )}
      </div>
      <TooltipProvider>
        {onLayerDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={t('delete')}
                  className="inline-flex size-4 shrink-0 items-center justify-center opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100 focus-visible:opacity-100"
                  onClick={handleDeleteClick}
                />
              }
            >
              <TrashEmpty className="size-4" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={6}
              className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
            >
              {t('delete')}
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={t(enabled ? 'hide' : 'show')}
                className="inline-flex size-4 shrink-0 items-center justify-center"
                onClick={e => {
                  e.stopPropagation();
                  handleEnableClick();
                }}
              />
            }
          >
            <Eye
              className={classNames('size-4', {
                'opacity-30': !enabled,
              })}
            />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
            className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
          >
            {t(enabled ? 'hide' : 'show')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
