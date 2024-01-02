import type { TSESLint } from '@typescript-eslint/utils'
import type { Rule } from 'eslint'

export function createRule<MessageIds extends string, RuleOptions extends any[]>(
  rule: TSESLint.RuleModule<MessageIds, RuleOptions>,
) {
  return rule as unknown as Rule.RuleModule
}
