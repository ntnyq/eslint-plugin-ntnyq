import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils'

export type ASTNode = TSESTree.Node
export type NodeTypes = `${AST_NODE_TYPES}`
export type Token = TSESTree.Token

export { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils'

export type { JSONSchema, TSESTree as Tree } from '@typescript-eslint/utils'
export type {
  RuleWithMeta,
  RuleWithMetaAndName,
} from '@typescript-eslint/utils/eslint-utils'
export type {
  EcmaVersion,
  ReportDescriptor,
  ReportFixFunction,
  RuleContext,
  RuleFixer,
  RuleFunction,
  RuleListener,
  RuleModule,
  Scope,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint'
