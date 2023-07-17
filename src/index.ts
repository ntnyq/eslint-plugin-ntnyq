import * as all from './configs/all'
import * as recommended from './configs/recommended'
import noMemberAccessibility from './rules/no-member-accessibility'
import type * as TSESLintUtils from '@typescript-eslint/utils'

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

export const rules: Record<string, TSESLintUtils.TSESLint.RuleModule<string>> = {
  'no-member-accessibility': noMemberAccessibility,
}

export default {
  meta,
  configs,
  rules,
}
