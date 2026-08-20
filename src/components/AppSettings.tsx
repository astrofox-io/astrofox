import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isDesktopApp } from '@/app/desktop';
import { getAutoUpdateCheck, setAutoUpdateCheck } from '@/app/preferences';
import Setting from '@/components/Setting';
import Settings from '@/components/Settings';
import i18nInstance, { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/i18n/config';

export default function AppSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings' });
  const [language, setLanguage] = useState<string>(
    () => i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'en',
  );
  const [autoUpdateCheck, setAutoUpdateCheckState] = useState<boolean>(() => getAutoUpdateCheck());

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
    if (props.autoUpdateCheck !== undefined) {
      const enabled = Boolean(props.autoUpdateCheck);
      setAutoUpdateCheck(enabled);
      setAutoUpdateCheckState(enabled);
    }

    const code = props.language as string | undefined;
    if (!code) return;

    try {
      window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    await i18nInstance.changeLanguage(code);
    setLanguage(i18nInstance.resolvedLanguage ?? i18nInstance.language ?? code);
  }

  return (
    <div className="flex w-[500px] max-w-full flex-col">
      <div className="max-h-[60vh] overflow-auto">
        <Settings columns={['50%', '50%']} onChange={props => void handleChange(props)}>
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
            label={t('auto-update-check')}
            type="toggle"
            name="autoUpdateCheck"
            value={autoUpdateCheck}
            hidden={!isDesktopApp()}
          />
        </Settings>
      </div>
    </div>
  );
}
