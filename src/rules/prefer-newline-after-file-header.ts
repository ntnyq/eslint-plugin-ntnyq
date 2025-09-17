import { SPECIAL_CHAR } from '../constants'
import { AST_TOKEN_TYPES } from '../types'
import { createESLintRule, resolveOptions } from '../utils'
import type { Tree } from '../types'

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
export type MessageIds = 'requireNewlineBefore'
export type Options = [
  {
    tags?: string[]
  },
]

const defaultOptions: Options[0] = {
  tags: FILE_HEADER_TAGS,
}

function isFileHeaderComment(comment: Tree.BlockComment, tags: string[]) {
  const reFileHeaderTag = new RegExp(`\\*\\s*(${tags.join('|')})`)
  return reFileHeaderTag.test(comment.value.trim())
}

/**
 * get first block comment
 */
function getFirstBlockComment(node: Tree.Program) {
  const firstComment = node.comments?.[0]

  // no comments
  if (!firstComment) {
    return
  }

  // not a block comment
  if (firstComment.type !== AST_TOKEN_TYPES.Block) {
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
      requireNewlineBefore: 'require a newline before',
    },
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const { tags: jsdocTags = FILE_HEADER_TAGS } = resolveOptions(
      context.options,
      defaultOptions,
    )

    return {
      Program(node) {
        const firstBlockComment = getFirstBlockComment(node)
        if (
          !firstBlockComment
          || !isFileHeaderComment(firstBlockComment, jsdocTags)
          || firstBlockComment.loc.start.line !== 1
          || firstBlockComment.range[0] !== 0
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
          messageId: 'requireNewlineBefore',
          fix(fixer) {
            return fixer.insertTextAfter(
              firstBlockComment,
              SPECIAL_CHAR.newline.repeat(2 - linesBetween),
            )
          },
        })
      },
    }
  },
})
