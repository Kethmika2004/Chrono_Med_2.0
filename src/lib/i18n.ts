import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getIntlayer } from 'intlayer';
import { Locales } from 'intlayer';

// This is a minimal setup for react-i18next. 
// Since we are using Intlayer, Intlayer handles the actual content delivery per component.
// react-i18next is useful if we still want to use t() hooks globally, but Intlayer's useIntlayer is preferred.
// We configure i18next here to be compatible with Intlayer's locale management if needed.

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: Locales.ENGLISH,
    lng: Locales.ENGLISH, // default language
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: { translation: {} },
      si: { translation: {} },
      ta: { translation: {} },
    }
  });

export default i18n;
