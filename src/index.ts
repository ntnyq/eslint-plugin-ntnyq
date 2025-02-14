import { configs } from './configs'
import { meta } from './meta'
import { rules } from './rules'
import type { ESLint } from 'eslint'

/**
 * eslint-plugin-ntnyq
 * An opinionated ESLint plugin.
 *
 * @see {@link https://github.com/ntnyq/eslint-plugin-ntnyq}
 */
// @keep-sorted
export const plugin = {
  configs,
  meta,
  rules,
} satisfies ESLint.Plugin

export * from './dts'
export * from './meta'
export * from './rules'
export * from './configs'

export default plugin
