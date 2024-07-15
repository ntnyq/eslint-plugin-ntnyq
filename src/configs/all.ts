/**
 * @file preset `all`
 */

import setup from './setup'
import type { Linter } from 'eslint'

export default [
  ...setup,
  {
    name: 'ntnyq/all/rules',
    rules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  },
] satisfies Linter.FlatConfig[]
