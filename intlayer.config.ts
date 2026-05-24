import { Locales, type IntlayerConfig } from "intlayer"

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.ENGLISH, Locales.SINHALESE, Locales.TAMIL],
    defaultLocale: Locales.ENGLISH,
  },
}

export default config
