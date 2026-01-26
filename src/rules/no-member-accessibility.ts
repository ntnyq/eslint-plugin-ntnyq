import { AST_TOKEN_TYPES } from '../types'
import { createESLintRule } from '../utils'
import type { Tree } from '../types'

export const RULE_NAME = 'no-member-accessibility'
export type MessageIds = 'noMemberAccessibility'
export type Options = []

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      recommended: false,
      description: 'disallow usage of typescript member accessibility',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noMemberAccessibility:
        'Disallow usage of typescript member accessibility',
    },
  },
  defaultOptions: [],
  create(context) {
    function handleMemberAccessibility(
      node:
        | Tree.MethodDefinition
        | Tree.PropertyDefinition
        | Tree.TSAbstractMethodDefinition
        | Tree.TSAbstractPropertyDefinition
        | Tree.TSParameterProperty,
    ) {
      if (!node.accessibility) {
        return
      }

      context.report({
        node,
        messageId: 'noMemberAccessibility',
        loc: {
          start: node.loc.start,
          end: {
            ...node.loc.start,
            column: node.loc.start.column + node.accessibility.length,
          },
        },
        fix(fixer) {
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
        },
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
