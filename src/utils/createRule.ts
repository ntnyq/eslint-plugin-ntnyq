import type { TSESLint } from '@typescript-eslint/utils'

export function createRule<MessageIds extends string, RuleOptions extends unknown[] = []>(
  rule: TSESLint.RuleModule<MessageIds, RuleOptions>,
) {
  return rule
}
