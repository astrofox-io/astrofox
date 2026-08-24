import { useTranslation } from 'react-i18next';
import { checkForDesktopUpdates, installDesktopUpdate } from '@/app/desktop';
import { env } from '@/app/global';
import useDesktopUpdaterStatus from '@/app/hooks/useDesktopUpdaterStatus';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

const { APP_NAME, APP_VERSION } = env;

interface AboutProps {
  onClose?: () => void;
}

export default function About({ onClose }: AboutProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'about' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });

  return (
    <div className="flex min-h-[16rem] w-[36rem] max-w-full flex-1 flex-col">
      <div
        className={
          'flex flex-1 flex-col items-center justify-center bg-[url(/images/about_bg.jpg)_no-repeat_center_center_fixed] p-8 text-center text-neutral-100'
        }
      >
        <div
          className={
            '[font-family:var(--font-oswald),_sans-serif] mb-8 text-2xl font-[100] uppercase tracking-widest'
          }
        >
          {APP_NAME}
        </div>
        <div className="mb-1">{t('version', { version: APP_VERSION })}</div>
        <div className="mb-2 text-neutral-300">{t('copyright')}</div>
        <UpdateStatus />
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

/** Desktop-only auto-update controls; renders nothing on the web build. */
function UpdateStatus() {
  const { t } = useTranslation(undefined, { keyPrefix: 'about' });
  const { updaterAvailable, status, setStatus } = useDesktopUpdaterStatus();

  if (!updaterAvailable) {
    return null;
  }

  const busy =
    status?.state === 'checking' ||
    status?.state === 'available' ||
    status?.state === 'downloading';

  function handleCheck() {
    setStatus({ state: 'checking' });
    void checkForDesktopUpdates().then(result => {
      if (!result.ok && result.reason) {
        setStatus({ state: 'error', message: result.reason });
      }
    });
  }

  function handleInstall() {
    void installDesktopUpdate();
  }

  let text: string | null = null;
  switch (status?.state) {
    case 'checking':
      text = t('update-checking');
      break;
    case 'available':
      text = t('update-available', { version: status.version ?? '' });
      break;
    case 'not-available':
      text = t('update-not-available');
      break;
    case 'downloading':
      text = t('update-downloading', { percent: Math.round(status.percent) });
      break;
    case 'downloaded':
      text = t('update-downloaded', { version: status.version ?? '' });
      break;
    case 'error':
      text = t('update-error', { message: status.message });
      break;
    default:
      text = null;
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2 text-sm">
      {text && <div className="max-w-full break-words text-neutral-300">{text}</div>}
      <div className="flex gap-2">
        {status?.state === 'downloaded' ? (
          <Button variant="default" size="xs" onClick={handleInstall}>
            {t('restart-to-update')}
          </Button>
        ) : (
          <Button variant="secondary" size="xs" disabled={busy} onClick={handleCheck}>
            {t('check-for-updates')}
          </Button>
        )}
      </div>
    </div>
  );
}
