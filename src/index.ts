import all from './configs/all'
import recommended from './configs/recommended'
import noMemberAccessibility from './rules/no-member-accessibility'
import type { ESLint, Linter } from 'eslint'

// defined in tsup.config.ts
declare const __PKG_NAME__: string
declare const __PKG_VERSION__: string

export const meta = {
  name: __PKG_NAME__,
  version: __PKG_VERSION__,
}

export const configs = {
  all,
  recommended,
}

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

export const plugin: ESLint.Plugin = {
  meta,
  configs,
  rules,
}

export default plugin

type RuleDefinitions = (typeof plugin)['rules']

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions']
}
export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
}
