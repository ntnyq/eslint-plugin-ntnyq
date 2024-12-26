import { configs } from './config'
import { meta } from './meta'
import { rules } from './rules'
import type { ESLint } from 'eslint'

export const plugin = {
  meta,
  configs,
  rules,
} satisfies ESLint.Plugin

export * from './dts'
export * from './meta'
export * from './rules'
export * from './config'

export default plugin
