const internationalization = {
  "locales": [
    "en",
    null,
    "ta"
  ],
  "requiredLocales": [
    "en",
    null,
    "ta"
  ],
  "strictMode": "inclusive",
  "defaultLocale": "en"
};
const routing = {
  "mode": "prefix-no-default",
  "storage": {
    "cookies": [
      {
        "name": "INTLAYER_LOCALE",
        "attributes": {}
      }
    ],
    "headers": [
      {
        "name": "x-intlayer-locale"
      }
    ]
  },
  "basePath": ""
};
const editor = {
  "editorURL": "http://localhost:8000",
  "cmsURL": "https://app.intlayer.org",
  "backendURL": "https://back.intlayer.org",
  "port": 8000,
  "enabled": false,
  "dictionaryPriorityStrategy": "local_first",
  "liveSync": false,
  "liveSyncPort": 4000,
  "liveSyncURL": "http://localhost:4000"
};
const log = {
  "mode": "default",
  "prefix": "\u001b[38;5;239m[intlayer] \u001b[0m"
};
const system = {
  "baseDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0",
  "moduleAugmentationDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\types",
  "unmergedDictionariesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\unmerged_dictionary",
  "remoteDictionariesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\remote_dictionary",
  "dictionariesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\dictionary",
  "dynamicDictionariesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\dynamic_dictionary",
  "fetchDictionariesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\fetch_dictionary",
  "typesDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\types",
  "mainDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\main",
  "configDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\config",
  "cacheDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\cache",
  "tempDir": "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0\\.intlayer\\tmp"
};
const content = {
  "fileExtensions": [
    ".content.ts",
    ".content.js",
    ".content.cjs",
    ".content.mjs",
    ".content.json",
    ".content.json5",
    ".content.jsonc",
    ".content.tsx",
    ".content.jsx",
    ".content.md",
    ".content.mdx",
    ".content.yaml",
    ".content.yml"
  ],
  "contentDir": [
    "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0"
  ],
  "codeDir": [
    "C:\\Users\\ssn computres\\Desktop\\chrono_med\\Chrono_Med_2.0"
  ],
  "excludedPath": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.intlayer/**",
    "**/.next/**",
    "**/.nuxt/**",
    "**/.expo/**",
    "**/.vercel/**",
    "**/.turbo/**",
    "**/.tanstack/**"
  ],
  "watch": true
};
const ai = {};
const dictionary = {
  "fill": true,
  "contentAutoTransformation": false,
  "location": "local",
  "importMode": "static"
};
const build = {
  "mode": "auto",
  "minify": false,
  "purge": false,
  "traversePattern": [
    "**/*.{tsx,ts,js,mjs,cjs,jsx,vue,svelte,astro}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/.intlayer/**",
    "!**/.next/**",
    "!**/.nuxt/**",
    "!**/.expo/**",
    "!**/.vercel/**",
    "!**/.turbo/**",
    "!**/.tanstack/**",
    "!**/*.config.*",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/*.stories.*",
    "!**/*.d.ts",
    "!**/*.d.ts.map",
    "!**/*.map"
  ],
  "outputFormat": [
    "esm",
    "cjs"
  ],
  "cache": true,
  "checkTypes": false
};
const compiler = {
  "enabled": true,
  "dictionaryKeyPrefix": "",
  "noMetadata": false,
  "saveComponents": false
};
const configuration = { internationalization, routing, editor, log, system, content, ai, dictionary, build, compiler };

export { internationalization, routing, editor, log, system, content, ai, dictionary, build, compiler, configuration };
export default configuration;
