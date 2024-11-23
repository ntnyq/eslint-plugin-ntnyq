import { configs } from './config'
import { meta } from './meta'
import noMemberAccessibility from './rules/no-member-accessibility'
import type { ESLint } from 'eslint'

export const rules = {
  'no-member-accessibility': noMemberAccessibility,
}

export const plugin = {
  meta,
  configs,
  rules,
} satisfies ESLint.Plugin

export default plugin

export * from './dts'
export * from './meta'
export * from './config'
