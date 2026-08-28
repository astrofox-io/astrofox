import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { checkForDesktopUpdates, installDesktopUpdate, isDesktopApp } from '@/app/desktop';
import { env } from '@/app/global';
import useDesktopUpdaterStatus from '@/app/hooks/useDesktopUpdaterStatus';
import {
  getAutomaticUpdates,
  getPlayAudioOnLoad,
  setAutomaticUpdates,
  setPlayAudioOnLoad,
} from '@/app/preferences';
import Setting from '@/components/Setting';
import Settings from '@/components/Settings';
import { Button } from '@/components/ui/button';
import i18nInstance, { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/i18n/config';
import { setItem } from '@/lib/storage';

export default function AppSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings' });
  const desktop = isDesktopApp();
  const [language, setLanguage] = useState<string>(
    () => i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'en',
  );
  const [automaticUpdates, setAutomaticUpdatesState] = useState<boolean>(() =>
    getAutomaticUpdates(),
  );
  const [playAudioOnLoad, setPlayAudioOnLoadState] = useState<boolean>(() => getPlayAudioOnLoad());

  useEffect(() => {
    const onChanged = (lng: string) => {
      setLanguage(lng);
    };
    i18nInstance.on('languageChanged', onChanged);
    // Sync once on mount in case language already changed before subscribing.
    setLanguage(i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'en');
    return () => {
      i18nInstance.off('languageChanged', onChanged);
    };
  }, []);

  async function handleChange(props: Record<string, unknown>) {
    if (props.automaticUpdates !== undefined) {
      const enabled = Boolean(props.automaticUpdates);
      setAutomaticUpdates(enabled);
      setAutomaticUpdatesState(enabled);
    }

    if (props.playAudioOnLoad !== undefined) {
      const enabled = Boolean(props.playAudioOnLoad);
      setPlayAudioOnLoad(enabled);
      setPlayAudioOnLoadState(enabled);
    }

    const code = props.language as string | undefined;
    if (!code) return;

    setItem(LANGUAGE_STORAGE_KEY, code);
    await i18nInstance.changeLanguage(code);
    setLanguage(i18nInstance.resolvedLanguage ?? i18nInstance.language ?? code);
  }

  const onChange = (props: Record<string, unknown>) => void handleChange(props);

  return (
    <div className="flex w-[500px] max-w-full flex-col">
      <div className="max-h-[60vh] overflow-auto">
        <Settings label={t('general')} columns={['50%', '50%']} onChange={onChange}>
          <Setting
            label={t('language')}
            type="select"
            name="language"
            value={language}
            items={SUPPORTED_LANGUAGES.map(lang => ({
              label: lang.label,
              value: lang.code,
            }))}
            width={180}
          />
          <Setting
            label={t('play-audio-on-load')}
            type="toggle"
            name="playAudioOnLoad"
            value={playAudioOnLoad}
          />
        </Settings>
        {desktop && (
          <Settings label={t('updates')} columns={['50%', '50%']} onChange={onChange}>
            <Setting
              label={t('automatic-updates')}
              type="toggle"
              name="automaticUpdates"
              value={automaticUpdates}
            />
            <VersionRow />
          </Settings>
        )}
      </div>
    </div>
  );
}

/** Current version plus update status and a manual "Check for updates" button. */
function VersionRow() {
  const { t } = useTranslation(undefined, { keyPrefix: 'about' });
  const desktop = isDesktopApp();
  const { updaterAvailable, status, setStatus } = useDesktopUpdaterStatus();

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

  let statusText: string | null = null;
  switch (status?.state) {
    case 'checking':
      statusText = t('update-checking');
      break;
    case 'available':
      statusText = t('update-available', { version: status.version ?? '' });
      break;
    case 'not-available':
      statusText = t('update-not-available');
      break;
    case 'downloading':
      statusText = t('update-downloading', { percent: Math.round(status.percent) });
      break;
    case 'downloaded':
      statusText = t('update-downloaded', { version: status.version ?? '' });
      break;
    case 'error':
      statusText = t('update-error', { message: status.message });
      break;
    default:
      statusText = null;
  }

  return (
    <div className="mb-4 flex items-center">
      <div className="mr-2 text-neutral-300" style={{ width: '50%' }}>
        {t('version', { version: env.APP_VERSION })}
        {statusText && (
          <div className="mt-1 break-words text-xs text-neutral-500">{statusText}</div>
        )}
      </div>
      <div style={{ width: '50%' }}>
        {desktop &&
          (status?.state === 'downloaded' ? (
            <Button variant="default" size="sm" onClick={handleInstall}>
              {t('restart-to-update')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy || !updaterAvailable}
              onClick={handleCheck}
            >
              {t('check-for-updates')}
            </Button>
          ))}
      </div>
    </div>
  );
}
