'use client';

import { Check, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import i18nInstance, { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/i18n/config';

export default function LanguageSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'title-bar' });
  const [currentLng, setCurrentLng] = useState<string>(
    () => i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'en',
  );

  useEffect(() => {
    const onChanged = (lng: string) => {
      setCurrentLng(lng);
    };
    i18nInstance.on('languageChanged', onChanged);
    // Sync once on mount in case language already changed before subscribing.
    setCurrentLng(i18nInstance.resolvedLanguage ?? i18nInstance.language ?? 'en');
    return () => {
      i18nInstance.off('languageChanged', onChanged);
    };
  }, []);

  const handleSelect = async (code: string) => {
    try {
      window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    await i18nInstance.changeLanguage(code);
    // Defensive: force local state in case event ordering surprises us.
    setCurrentLng(i18nInstance.resolvedLanguage ?? i18nInstance.language ?? code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            aria-label={t('language')}
          />
        }
      >
        <Globe size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-40">
        {SUPPORTED_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              void handleSelect(lang.code);
            }}
          >
            {lang.label}
            {currentLng === lang.code && <Check size={16} className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
