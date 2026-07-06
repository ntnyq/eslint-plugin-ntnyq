// @ts-check

import { defineESLintConfig } from '@ntnyq/eslint-config'

export default defineESLintConfig({
  ignores: ['tests/fixtures/**'],
  svgo: true,
  eslintPlugin: {
    overrides: {
      // https://github.com/typescript-eslint/typescript-eslint/pull/12663
      'eslint-plugin/require-meta-languages': 'off',
    },
  },
  test: {
    vitest: {
      overrides: {
        // in favor of eslint-vitest-rule-tester
        'vitest/no-standalone-expect': 'off',
      },
    },
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
})
