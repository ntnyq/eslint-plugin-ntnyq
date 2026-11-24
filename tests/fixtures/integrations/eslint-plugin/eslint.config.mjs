import { defineConfig } from 'eslint/config'
import { configsTypeScript } from '@ntnyq/eslint-config'
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default defineConfig(
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      }
    },
    extends: configsTypeScript.recommended
  },
  {
    plugins: {
      ntnyq: pluginNtnyq,
    },
    rules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  },
)
