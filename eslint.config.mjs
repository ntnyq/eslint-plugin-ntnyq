// @ts-check

import { defineESLintConfig } from '@ntnyq/eslint-config'
import pluginESLintPlugin from 'eslint-plugin-eslint-plugin'

const config = defineESLintConfig(
  {
    ignores: ['**/tests/fixtures'],
  },
  [
    {
      ...pluginESLintPlugin.configs['flat/all'],
      rules: {
        ...pluginESLintPlugin.configs['flat/all'].rules,
        'eslint-plugin/require-meta-docs-url': 'off',
      },
    },
  ],
)

export default config
