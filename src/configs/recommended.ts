/**
 * @file preset `recommended`
 */

import setup from './setup'
import type { Linter } from 'eslint'

export default [
  ...setup,
  {
    name: 'ntnyq/recommended/rules',
    rules: {},
  },
] satisfies Linter.Config[]
