import { Locales, type IntlayerConfig } from "intlayer"

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.SINHALA,
      Locales.TAMIL,
      Locales.HINDI,
      Locales.FRENCH,
      Locales.GERMAN,
      Locales.ARABIC,
      Locales.JAPANESE,
      Locales.CHINESE,
      Locales.SPANISH
    ],
    defaultLocale: Locales.ENGLISH,
  },
}

export default config
