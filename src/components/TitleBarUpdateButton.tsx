import { DownloadCloud, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { installDesktopUpdate } from '@/app/desktop';
import useDesktopUpdaterStatus from '@/app/hooks/useDesktopUpdaterStatus';
import { Button } from '@/components/ui/button';

export default function TitleBarUpdateButton() {
  const { t } = useTranslation(undefined, { keyPrefix: 'title-bar' });
  const { t: ta } = useTranslation(undefined, { keyPrefix: 'about' });
  const { status } = useDesktopUpdaterStatus();
  const [busy, setBusy] = useState(false);

  if (status?.state !== 'downloaded') {
    return null;
  }

  async function handleClick() {
    if (busy) return;

    setBusy(true);
    const result = await installDesktopUpdate();

    if (!result.ok) {
      setBusy(false);
    }
  }

  const label = t('update');
  const title = ta('update-downloaded', { version: status.version ?? '' });

  return (
    <Button
      type="button"
      variant="default"
      size="xs"
      className="mr-1 h-7 max-w-45 gap-1 rounded-md px-2 text-[11px] font-medium"
      aria-label={label}
      disabled={busy}
      title={title}
      onClick={() => {
        void handleClick();
      }}
    >
      {busy ? (
        <LoaderCircle className="size-3 animate-spin" />
      ) : (
        <DownloadCloud className="size-3" />
      )}
      <span className="truncate">{label}</span>
    </Button>
  );
}
