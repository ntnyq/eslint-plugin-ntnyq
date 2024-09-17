import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils'

export type ASTNode = TSESTree.Node
export type Toeken = TSESTree.Token
export type NodeTypes = `${AST_NODE_TYPES}`
export type { TSESTree as Tree }
export type { JSONSchema } from '@typescript-eslint/utils'
export type {
  ReportDescriptor,
  ReportFixFunction,
  RuleContext,
  RuleFixer,
  RuleFunction,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint'
