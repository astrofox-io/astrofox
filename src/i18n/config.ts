import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import de from '../../messages/de.json';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import fr from '../../messages/fr.json';
import ja from '../../messages/ja.json';
import ko from '../../messages/ko.json';
import vi from '../../messages/vi.json';
import zhCN from '../../messages/zh-CN.json';
import zhTW from '../../messages/zh-TW.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'astrofox.language';

const isBrowser = typeof window !== 'undefined';

if (!i18n.isInitialized) {
  const instance = i18n.use(initReactI18next);

  if (isBrowser) {
    instance.use(LanguageDetector);
  }

  instance.init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      vi: { translation: vi },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
    },
    lng: isBrowser ? undefined : DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },
  });
}

// Expose for debugging from devtools.
if (isBrowser) {
  (window as unknown as { i18n?: typeof i18n }).i18n = i18n;
}

const translate: (typeof i18n)['t'] = i18n.t.bind(i18n);

export { translate as t };

export default i18n;
