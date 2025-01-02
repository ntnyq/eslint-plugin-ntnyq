import { AST_TOKEN_TYPES } from '@typescript-eslint/utils'
import { createESLintRule } from '../utils'
import type { Tree } from '../types'

export const RULE_NAME = 'prefer-newline-after-file-header'
export type MessageIds = 'requireNewlineBefore'
export type Options = []

/**
 * get first block comment
 */
function getFirstBlockComment(node: Tree.Program) {
  const firstComment = node.comments?.[0]

  // no comments
  if (!firstComment) return

  // not a block comment
  if (firstComment.type !== AST_TOKEN_TYPES.Block) return

  return firstComment
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      recommended: true,
      description: 'require a newline after file header',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      requireNewlineBefore: 'require a newline before',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(node) {
        const firstBlockComment = getFirstBlockComment(node)

        if (!firstBlockComment) {
          return
        }

        // file header should be at the start of first line
        if (firstBlockComment.loc.start.line !== 1 || firstBlockComment.range[0] !== 0) {
          return
        }

        const firstNode = node.body[0]

        if (!firstNode) {
          return
        }

        const lineDelta = firstNode.loc.start.line - firstBlockComment.loc.end.line

        if (lineDelta > 1) {
          return
        }

        context.report({
          node: firstNode,
          messageId: 'requireNewlineBefore',
          fix: fixer => fixer.insertTextAfter(firstBlockComment, '\n'.repeat(2 - lineDelta)),
        })
      },
    }
  },
})
