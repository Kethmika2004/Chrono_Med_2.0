import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'si', 'ta', 'hi', 'fr', 'de', 'ar', 'ja', 'zh', 'es'],
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: {} },
      si: { translation: {} },
      ta: { translation: {} },
      hi: { translation: {} },
      fr: { translation: {} },
      de: { translation: {} },
      ar: { translation: {} },
      ja: { translation: {} },
      zh: { translation: {} },
      es: { translation: {} },
    },
  });

export default i18n;
