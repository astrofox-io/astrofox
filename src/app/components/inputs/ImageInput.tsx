import { clsx as classNames } from 'cnfast';
import type React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { raiseError } from '@/app/actions/error';
import { BLANK_IMAGE } from '@/app/constants';
import { api } from '@/app/global';
import { FolderOpen, Times } from '@/app/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFileSystemPath } from '@/lib/utils/media';
import { ignoreEvents } from '@/lib/utils/react';

interface ImageInputProps {
  name: string;
  value?: string;
  onChange?: (props: Record<string, unknown>) => void;
}

export default function ImageInput({ name, value, onChange }: ImageInputProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'inputs' });
  const { t: te } = useTranslation(undefined, { keyPrefix: 'errors' });
  const image = useRef<HTMLImageElement>(null);
  const hasImage = Boolean(value) && value !== BLANK_IMAGE;

  function loadImageSrc(src: string | ArrayBuffer | null) {
    if (image.current && image.current.src !== src) {
      image.current.src = String(src);
    }
  }

  async function loadImageFile(file: File) {
    try {
      const sourcePath = getFileSystemPath(file);
      const src = await api.readImageFile(file);
      if (typeof src !== 'string') {
        throw new Error('The selected image could not be decoded');
      }

      const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error('The selected image could not be decoded'));
        nextImage.src = src;
      });

      loadImageSrc(src);
      onChange?.({
        [name]: loadedImage,
        sourcePath: sourcePath || '',
      });
    } catch (error) {
      raiseError(te('invalid-image-file'), error);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    await loadImageFile(e.dataTransfer.files[0]);
  }

  async function handleClick() {
    const { files, canceled } = await api.showOpenDialog({
      filters: [{ name: t('image-files'), extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
    });

    if (!canceled && files && files.length) {
      await loadImageFile(files[0]);
    }
  }

  function handleDelete() {
    loadImageSrc(BLANK_IMAGE);
    onChange?.({
      [name]: BLANK_IMAGE,
      sourcePath: '',
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={
          'relative h-24 w-24 overflow-hidden rounded border-border bg-neutral-900 p-0 shadow-none hover:bg-neutral-900 [&:hover_.open-icon]:scale-100 [&:hover_.open-icon]:opacity-100'
        }
        onDrop={handleDrop}
        onDragOver={ignoreEvents}
        onClick={handleClick}
      >
        {/* biome-ignore lint/performance/noImgElement: User-selected blob and data URLs need a native image element. */}
        <img
          ref={image}
          className={classNames('absolute top-1/2 h-auto w-full -translate-y-1/2', {
            hidden: !hasImage,
          })}
          src={value || undefined}
          alt=""
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <FolderOpen
                  className={
                    'open-icon absolute top-0 right-0 bottom-0 left-0 m-auto h-4 w-4 scale-50 text-neutral-100 opacity-0 transition-[all_0.25s] [filter:drop-shadow(1px_1px_1px_#000)]'
                  }
                />
              }
            />
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="z-100 rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg"
            >
              {t('open-file')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Button>
      {hasImage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-neutral-300 hover:bg-transparent hover:text-neutral-100"
                  onClick={handleDelete}
                >
                  <Times className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent
              side="bottom"
              sideOffset={6}
              className="z-100 rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg"
            >
              {t('remove-image')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
