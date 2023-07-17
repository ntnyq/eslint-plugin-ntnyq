import * as TSESLintUtils from '@typescript-eslint/utils'

export const createESLintRule = TSESLintUtils.ESLintUtils.RuleCreator(ruleName => ruleName)
