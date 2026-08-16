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
import { getFileSystemPath, resolveVideoSourceUrl } from '@/lib/utils/media';
import { ignoreEvents } from '@/lib/utils/react';

interface VideoInputProps {
  name: string;
  value?: string;
  onChange?: (props: Record<string, unknown>) => void;
}

export default function VideoInput({ name, value, onChange }: VideoInputProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'inputs' });
  const { t: te } = useTranslation(undefined, { keyPrefix: 'errors' });
  const video = useRef<HTMLVideoElement>(null);
  const hasVideo = value !== BLANK_IMAGE;

  function loadVideoSrc(src: string | ArrayBuffer | null) {
    if (video.current && video.current.src !== src) {
      video.current.src = String(src);
    }
  }

  function loadVideoMetadata(src: string) {
    return new Promise<HTMLVideoElement>((resolve, reject) => {
      const loadedVideo = document.createElement('video');
      loadedVideo.muted = true;
      loadedVideo.playsInline = true;
      loadedVideo.preload = 'metadata';
      loadedVideo.crossOrigin = 'anonymous';

      loadedVideo.onloadedmetadata = () => {
        loadedVideo.onloadedmetadata = null;
        loadedVideo.onerror = null;
        resolve(loadedVideo);
      };
      loadedVideo.onerror = () => {
        loadedVideo.onloadedmetadata = null;
        loadedVideo.onerror = null;
        loadedVideo.removeAttribute('src');
        loadedVideo.load();
        reject(new Error('The selected video metadata could not be loaded'));
      };
      loadedVideo.src = src;
    });
  }

  async function loadVideoFile(file: File) {
    try {
      const sourcePath = getFileSystemPath(file);
      const src = resolveVideoSourceUrl(file, sourcePath);
      const loadedVideo = await loadVideoMetadata(src);

      loadVideoSrc(src);
      onChange?.({
        [name]: loadedVideo,
        sourcePath: sourcePath || '',
      });
    } catch (error) {
      raiseError(te('invalid-video-file'), error);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    await loadVideoFile(e.dataTransfer.files[0]);
  }

  async function handleClick() {
    const { files, canceled } = await api.showOpenDialog({
      filters: [{ name: t('video-files'), extensions: ['mp4', 'webm', 'ogv'] }],
    });

    if (!canceled && files && files.length) {
      await loadVideoFile(files[0]);
    }
  }

  function handleDelete() {
    loadVideoSrc('');
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
        <video
          ref={video}
          className={classNames('absolute top-1/2 h-auto w-full -translate-y-1/2', {
            hidden: !hasVideo,
          })}
          src={hasVideo ? value : undefined}
          muted
          loop
          autoPlay
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
      {hasVideo && (
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
              {t('remove-video')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
