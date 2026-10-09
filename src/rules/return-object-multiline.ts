import { createESLintRule } from '../utils'
import type { Tree } from '../types'

export const RULE_NAME = 'return-object-multiline'

export type MessageIds = 'multiline'
export type Options = []

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      recommended: false,
      description: 'require multiline formatting for directly returned objects',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      multiline:
        'Returned objects must use multiline formatting with each property on a separate line.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    const newline = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    return {
      'ReturnStatement > ObjectExpression.argument, ArrowFunctionExpression > ObjectExpression.body':
        function (node: Tree.ObjectExpression) {
          const parts = [...node.properties, sourceCode.getLastToken(node)!]
          const ranges: Tree.Range[] = []
          let previousEndLine = node.loc.start.line

          for (const part of parts) {
            if (previousEndLine === part.loc.start.line) {
              // Only replace whitespace after the preceding token or comment.
              // Keep commas, comments, and the return expression intact.
              const previousToken = sourceCode.getTokenBefore(part, {
                includeComments: true,
              })!
              ranges.push([previousToken.range[1], part.range[0]])
            }
            previousEndLine = part.loc.end.line
          }

          if (ranges.length) {
            context.report({
              node,
              messageId: 'multiline',
              fix(fixer) {
                return ranges.map(range =>
                  fixer.replaceTextRange(range, newline),
                )
              },
            })
          }
        },
    }
  },
})
