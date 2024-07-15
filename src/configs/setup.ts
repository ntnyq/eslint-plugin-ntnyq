/**
 * @file base
 */

import { plugin } from '..'
import type { Linter } from 'eslint'

export default [
  {
    name: 'ntnyq/setup',
    files: ['**/*.ts'],
    plugins: {
      get ntnyq() {
        return plugin
      },
    },
  },
] satisfies Linter.FlatConfig[]
