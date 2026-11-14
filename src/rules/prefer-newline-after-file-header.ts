import { AST_TOKEN_TYPES } from '../eslint'
import { createESLintRule } from '../utils'
import type { Tree } from '../eslint'

// @keep-sorted
const FILE_HEADER_TAGS = [
  '@author',
  '@category',
  '@copyright',
  '@date',
  '@file',
  '@fileoverview',
  '@license',
  '@module',
  '@overview',
]

export const RULE_NAME = 'prefer-newline-after-file-header'

export type MessageIds = 'missingBlankLineAfterHeader'
export type Options = [
  {
    tags?: string[]
  },
]

const defaultOptions: Options[0] = {
  tags: FILE_HEADER_TAGS,
}

function isFileHeaderComment(comment: Tree.BlockComment, tags: string[]) {
  if (!tags.length) {
    return false
  }

  const escapedTags = tags.map(tag =>
    tag.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'),
  )
  const reFileHeaderTag = new RegExp(`\\*\\s*(${escapedTags.join('|')})`, 'u')

  return reFileHeaderTag.test(comment.value.trim())
}

/**
 * get first block comment
 */
function getFirstBlockComment(node: Tree.Program) {
  const firstComment = node.comments?.[0]

  // no comments or not a block comment
  if (!firstComment || firstComment.type !== AST_TOKEN_TYPES.Block) {
    return
  }

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
    schema: [
      {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            description: 'file header jsdoc tags',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      missingBlankLineAfterHeader:
        'Require a blank line after the file header.',
    },
  },
  create(context, [{ tags: jsdocTags = FILE_HEADER_TAGS }]) {
    const newline = context.sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    return {
      Program(node) {
        const firstBlockComment = getFirstBlockComment(node)

        if (
          !firstBlockComment ||
          !isFileHeaderComment(firstBlockComment, jsdocTags) ||
          firstBlockComment.loc.start.line !== 1 ||
          firstBlockComment.range[0] !== 0
        ) {
          return
        }

        const firstNode = node.body[0]

        if (!firstNode) {
          return
        }

        const linesBetween =
          firstNode.loc.start.line - firstBlockComment.loc.end.line

        if (linesBetween > 1) {
          return
        }

        context.report({
          node: firstNode,
          messageId: 'missingBlankLineAfterHeader',
          fix(fixer) {
            return fixer.insertTextAfter(
              firstBlockComment,
              newline.repeat(2 - linesBetween),
            )
          },
        })
      },
    }
  },
})
