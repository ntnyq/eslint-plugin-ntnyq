import { AST_TOKEN_TYPES } from '@typescript-eslint/utils'
import { createESLintRule } from '../utils'
import type { RuleContext, RuleFixer, Tree } from '../types'

export const RULE_NAME = 'no-member-accessibility'
export type MessageIds = 'noMemberAccessibility'
export type Options = []

type MemberAccessibilityNode =
  | Tree.MethodDefinition
  | Tree.PropertyDefinition
  | Tree.TSAbstractMethodDefinition
  | Tree.TSAbstractPropertyDefinition
  | Tree.TSParameterProperty

function fixRemoveMemberAccessibility(
  node: MemberAccessibilityNode,
  context: Readonly<RuleContext<MessageIds, Options>>,
  fixer: RuleFixer,
) {
  const sourceCode = context.sourceCode
  const tokens = sourceCode.getTokens(node)
  let rangeToRemove: Tree.Range
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (
      token.type === AST_TOKEN_TYPES.Keyword &&
      ['public', 'private', 'protected'].includes(token.value)
    ) {
      rangeToRemove = [token.range[0], tokens[i + 1].range[0]]
      break
    }
  }

  return fixer.removeRange(rangeToRemove!)
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      recommended: false,
      description: 'disallow usage of typescript member accessibility',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noMemberAccessibility: 'Disallow usage of typescript member accessibility',
    },
  },
  defaultOptions: [],
  create(context) {
    const handleMemberAccessibility = (node: MemberAccessibilityNode) => {
      if (!node.accessibility) return
      context.report({
        node,
        messageId: 'noMemberAccessibility',
        loc: {
          start: node.loc.start,
          end: {
            ...node.loc.start,
            column: node.loc.start.column + (node.accessibility?.length ?? 0),
          },
        },
        fix: fixer => fixRemoveMemberAccessibility(node, context, fixer),
      })
    }
    return {
      MethodDefinition: handleMemberAccessibility,
      TSAbstractMethodDefinition: handleMemberAccessibility,
      PropertyDefinition: handleMemberAccessibility,
      TSAbstractPropertyDefinition: handleMemberAccessibility,
      TSParameterProperty: handleMemberAccessibility,
    }
  },
})
