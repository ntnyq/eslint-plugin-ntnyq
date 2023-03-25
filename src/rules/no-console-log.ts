import { createESLintRule } from '../utils'
import type { TSESTree } from '@typescript-eslint/utils'

export const RULE_NAME = 'no-console-log'
export type MessageIds = 'noConsoleLog'
export type Options = []

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disable comsole.log usage',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noConsoleLog: 'Disable comsole.log usage',
    },
  },
  defaultOptions: [],
  create: context => {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return
        const object = node.callee.object as TSESTree.Identifier
        const property = node.callee.property as TSESTree.Identifier
        if (object.name === 'console' && property.name === 'log') {
          context.report({
            node,
            loc: {
              start: object.loc.start,
              end: property.loc.end,
            },
            messageId: 'noConsoleLog',
            fix(fixer) {
              return fixer.remove(node)
            },
          })
        }
      },
    }
  },
})
