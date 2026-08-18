import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProject, { type MediaRef, relinkMediaRef } from '@/app/actions/project';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface RelinkMediaDialogProps {
  onClose?: () => void;
}

export default function RelinkMediaDialog({ onClose }: RelinkMediaDialogProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'relink-media' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const mediaRefs = useProject(state => state.unresolvedMediaRefs) as MediaRef[];
  const [loadingDisplayId, setLoadingDisplayId] = useState<string | null>(null);

  async function handleRelink(ref: MediaRef) {
    setLoadingDisplayId(ref.displayId);
    await relinkMediaRef(ref);
    setLoadingDisplayId(null);
  }

  if (!mediaRefs.length) {
    return (
      <div className="flex min-h-[14rem] min-w-[32rem] max-w-full flex-1 flex-col">
        <div className="flex-1 p-4 text-sm opacity-[0.8]">{t('all-resolved')}</div>
        <div className="shrink-0 bg-neutral-800 px-4 py-3">
          <DialogFooter className="sm:justify-end">
            <Button variant="default" size="sm" onClick={onClose}>
              {tc('close')}
            </Button>
          </DialogFooter>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[16rem] min-w-[32rem] max-w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto p-4">
        <div className={'text-sm opacity-[0.85]'}>{t('relink-message')}</div>
        <div className={'flex flex-col gap-1.5'}>
          {mediaRefs.map(ref => (
            <div
              key={ref.displayId}
              className={'flex items-center justify-between gap-2.5 border border-[#444] px-2 py-2'}
            >
              <div className={'min-w-0'}>
                <div className={'text-sm'}>
                  {ref.label} ({ref.kind})
                </div>
                {ref.sourcePath ? (
                  <div className={'max-w-[24rem] truncate text-xs opacity-[0.7]'}>
                    {ref.sourcePath}
                  </div>
                ) : null}
              </div>
              <Button
                variant="default"
                size="sm"
                disabled={loadingDisplayId === ref.displayId}
                onClick={() => handleRelink(ref)}
              >
                {loadingDisplayId === ref.displayId ? tc('loading') : t('relink')}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="sm:justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            {tc('close')}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
