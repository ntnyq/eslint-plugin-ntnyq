import { createESLintRule } from '../utils'

export const RULE_NAME = 'prefer-if-newline'
export type MessageIds = 'preferIfNewline'
export type Options = []

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Prefer newline after if',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferIfNewline: 'prefer newline after if',
    },
  },
  defaultOptions: [],
  create: context => {
    return {
      IfStatement(node) {
        if (!node.consequent) return
        if (node.consequent.type === 'BlockStatement') return

        if (node.test.loc.end.line === node.consequent.loc.start.line) {
          context.report({
            node,
            loc: {
              start: node.test.loc.end,
              end: node.consequent.loc.start,
            },
            messageId: 'preferIfNewline',
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.consequent.range[0], node.consequent.range[0]],
                '\n',
              )
            },
          })
        }
      },
    }
  },
})
