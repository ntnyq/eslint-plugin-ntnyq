/**
 * @copyright {@link https://github.com/antfu/eslint-plugin-antfu}
 */

import { createESLintRule } from '../utils'

const DEFAULT_INDENT = 2
const DEFAULT_TAGS = ['$', 'unindent', 'unIndent']
const RE_FULL_WHITESPACE = /^\s*$/u

export const RULE_NAME = 'indent-unindent'
export type MessageIds = 'indentUnindent'
export type Options = [
  {
    indent?: number
    tags?: string[]
  },
]

const defaultOptions: Options[0] = {
  indent: DEFAULT_INDENT,
  tags: DEFAULT_TAGS,
}

/**
 * Removes the common indentation and leading or trailing blank lines from a
 * template's raw value.
 */
function unindent(value: string) {
  const lines = value.split('\n')
  const whitespaceLines = lines.map(line => RE_FULL_WHITESPACE.test(line))
  const commonIndent = lines.reduce((minimum, line, index) => {
    if (whitespaceLines[index]) {
      return minimum
    }
    const indent = line.match(/^\s*/u)?.[0].length
    return indent === undefined ? minimum : Math.min(minimum, indent)
  }, Number.POSITIVE_INFINITY)

  let emptyLinesHead = 0
  while (emptyLinesHead < lines.length && whitespaceLines[emptyLinesHead]) {
    emptyLinesHead += 1
  }

  let emptyLinesTail = 0
  while (
    emptyLinesTail < lines.length &&
    whitespaceLines[lines.length - emptyLinesTail - 1]
  ) {
    emptyLinesTail += 1
  }

  return lines
    .slice(emptyLinesHead, lines.length - emptyLinesTail)
    .map(line => line.slice(commonIndent))
    .join('\n')
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      recommended: false,
      description:
        'enforce consistent indentation in unindent tagged templates',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          indent: {
            type: 'number',
            description:
              'number of spaces added relative to the containing line',
            minimum: 0,
          },
          tags: {
            type: 'array',
            description: 'tag identifiers whose templates should be checked',
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
      indentUnindent:
        'Enforce consistent indentation in the {{tag}} tagged template.',
    },
  },
  create(context) {
    const { indent = DEFAULT_INDENT, tags = DEFAULT_TAGS } =
      context.options[0] ?? defaultOptions

    return {
      TaggedTemplateExpression(node) {
        if (node.tag.type !== 'Identifier' || !tags.includes(node.tag.name)) {
          return
        }
        if (node.quasi.quasis.length !== 1) {
          return
        }

        const quasi = node.quasi.quasis[0]
        /* v8 ignore start */
        if (!quasi) {
          return
        }
        /* v8 ignore stop */

        const value = quasi.value.raw
        const lineStartIndex = context.sourceCode.getIndexFromLoc({
          line: node.loc.start.line,
          column: 0,
        })
        const baseIndent =
          context.sourceCode.text.slice(lineStartIndex).match(/^\s*/u)?.[0] ??
          ''
        const targetIndent = `${baseIndent}${' '.repeat(indent)}`
        const content = unindent(value)
          .split('\n')
          .map(line =>
            RE_FULL_WHITESPACE.test(line) ? '' : `${targetIndent}${line}`,
          )
          .join('\n')
        const fixedValue = `\n${content}\n${baseIndent}`

        if (fixedValue === value) {
          return
        }

        context.report({
          node: quasi,
          messageId: 'indentUnindent',
          data: {
            tag: node.tag.name,
          },
          fix: fixer => fixer.replaceText(quasi, `\`${fixedValue}\``),
        })
      },
    }
  },
})
