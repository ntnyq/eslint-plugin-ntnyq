import { meta } from './meta'
import { rules } from './rules'
import type { ESLint } from 'eslint'

/**
 * eslint-plugin-ntnyq
 *
 * @description An opinionated ESLint plugin.
 *
 * @see {@link https://github.com/ntnyq/eslint-plugin-ntnyq}
 */
// @keep-sorted
export const plugin = {
  meta,
  rules,
} satisfies ESLint.Plugin

export * from './dts'
export * from './meta'
export * from './rules'

export default plugin
