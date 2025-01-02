import { configs } from './configs'
import { meta } from './meta'
import { rules } from './rules'
import type { ESLint, Rule } from 'eslint'

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
  // FIXME: type not match
  rules: rules as unknown as Record<string, Rule.RuleModule>,
} satisfies ESLint.Plugin

export * from './dts'
export * from './meta'
export * from './rules'
export * from './configs'

export default plugin
