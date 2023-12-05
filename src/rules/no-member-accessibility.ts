import { AST_TOKEN_TYPES } from '@typescript-eslint/utils'
import { createRule } from '../utils'
import type { RuleContext, RuleFixer, Tree } from '../types'

export const RULE_NAME = 'no-member-accessibility'
export const messageId = 'noMemberAccessibility'
export type MessageIds = typeof messageId
export type RuleOptions = []

type MemberAccessibilityNode =
  | Tree.MethodDefinition
  | Tree.PropertyDefinition
  | Tree.TSAbstractMethodDefinition
  | Tree.TSAbstractPropertyDefinition
  | Tree.TSParameterProperty

function fixRemoveMemberAccessibility(
  node: MemberAccessibilityNode,
  context: Readonly<RuleContext<MessageIds, RuleOptions>>,
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

const rule = createRule<MessageIds, RuleOptions>({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow usage of typescript member accessibility',
      recommended: 'stylistic',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noMemberAccessibility: 'Disallow usage of typescript member accessibility',
    },
  },
  create: context => {
    const handleMemberAccessibility = (node: MemberAccessibilityNode) => {
      if (!node.accessibility) return
      context.report({
        node,
        messageId,
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

export default rule
