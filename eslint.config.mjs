// @ts-check

import { defineESLintConfig } from '@ntnyq/eslint-config'

export default defineESLintConfig({
  eslintPlugin: true,
  ignores: ['**/tests/fixtures'],
  svgo: true,
})
