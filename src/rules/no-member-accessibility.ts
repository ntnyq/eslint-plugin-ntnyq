import { AST_TOKEN_TYPES } from '../eslint'
import { createESLintRule } from '../utils'
import type { Tree } from '../eslint'

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
  create(context) {
    function handleMemberAccessibility(
      node:
        | Tree.AccessorProperty
        | Tree.MethodDefinition
        | Tree.PropertyDefinition
        | Tree.TSAbstractAccessorProperty
        | Tree.TSAbstractMethodDefinition
        | Tree.TSAbstractPropertyDefinition
        | Tree.TSParameterProperty,
    ) {
      if (!node.accessibility) {
        return
      }

      const sourceCode = context.sourceCode
      const modifiersStart = node.decorators.at(-1)?.range[1] ?? node.range[0]
      const accessibilityToken = sourceCode
        .getTokens(node)
        .find(
          token =>
            token.range[0] >= modifiersStart &&
            token.type === AST_TOKEN_TYPES.Keyword &&
            token.value === node.accessibility,
        )

      if (!accessibilityToken) {
        return
      }

      context.report({
        node,
        messageId: 'noMemberAccessibility',
        loc: accessibilityToken.loc,
        fix(fixer) {
          // Removing the sole parameter-property modifier removes the emitted
          // instance field assignment. Keep it for a manual rewrite.
          if (node.type === 'TSParameterProperty' && !node.readonly) {
            return null
          }

          const trailingWhitespaceLength =
            sourceCode.text
              .slice(accessibilityToken.range[1])
              .match(/^[\t ]+/u)?.[0].length ?? 0

          return fixer.removeRange([
            accessibilityToken.range[0],
            accessibilityToken.range[1] + trailingWhitespaceLength,
          ])
        },
      })
    }

    return {
      AccessorProperty: handleMemberAccessibility,
      TSAbstractAccessorProperty: handleMemberAccessibility,
      MethodDefinition: handleMemberAccessibility,
      TSAbstractMethodDefinition: handleMemberAccessibility,
      PropertyDefinition: handleMemberAccessibility,
      TSAbstractPropertyDefinition: handleMemberAccessibility,
      TSParameterProperty: handleMemberAccessibility,
    }
  },
})
