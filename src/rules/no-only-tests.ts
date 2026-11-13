import { ASTUtils } from '@typescript-eslint/utils'
import { createESLintRule, resolveOptions } from '../utils'
import type { Tree } from '../types'

export const RULE_NAME = 'no-only-tests'

export type MessageIds = 'unexpected'
export type Options = [
  {
    block?: string[]
    focus?: string[]
    functions?: string[]
    fix?: boolean
  },
]

const defaultOptions: Options[0] = {
  block: [
    'describe',
    'it',
    'context',
    'test',
    'tape',
    'fixture',
    'serial',
    'Feature',
    'Scenario',
    'Given',
    'And',
    'When',
    'Then',
  ],
  focus: ['only'],
  functions: [],
  fix: false,
}

function isMemberExpression(node: Tree.Node): node is Tree.MemberExpression {
  return node.type === 'MemberExpression'
}

function isCallExpression(node: Tree.Node): node is Tree.CallExpression {
  return node.type === 'CallExpression'
}

function getNodeName(node: Tree.Node): string | undefined {
  if (node.type === 'Identifier') {
    return node.name
  }

  if (node.type === 'MemberExpression') {
    return ASTUtils.getPropertyName(node) ?? undefined
  }

  return undefined
}

function getCallPath(
  node: Tree.Node,
  path: string[] = [],
): string[] | undefined {
  if (
    node.type === 'ChainExpression' ||
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSNonNullExpression'
  ) {
    return getCallPath(node.expression, path)
  }
  const nodeName = getNodeName(node)

  if (isMemberExpression(node) && nodeName) {
    return getCallPath(node.object, [nodeName, ...path])
  }

  if (isCallExpression(node)) {
    return getCallPath(node.callee, path)
  }

  if (nodeName) {
    return [nodeName, ...path]
  }

  return undefined
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      recommended: true,
      description: 'disallow .only blocks in tests',
    },
    fixable: 'code',
    schema: [
      {
        properties: {
          block: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            description: 'List of block names to check for .only',
          },
          focus: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            description: 'List of focus names to check for .only',
          },
          functions: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            description: 'List of function names to check for .only',
          },
          fix: {
            type: 'boolean',
            description: 'Whether to automatically fix .only blocks',
          },
        },
        type: 'object',
        description: 'Configuration options for the rule',
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      unexpected: '{{type}} not permitted',
    },
  },
  create(context) {
    const {
      block = [],
      focus = [],
      functions = [],
      fix = false,
    } = resolveOptions(context.options, defaultOptions)

    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          !functions.includes(node.callee.name)
        ) {
          return
        }

        context.report({
          node: node.callee,
          messageId: 'unexpected',
          data: {
            type: node.callee.name,
          },
        })
      },
      MemberExpression(node) {
        const propertyName = getNodeName(node)
        if (!propertyName || !focus.includes(propertyName)) {
          return
        }

        const callPath = getCallPath(node)?.join('.')
        if (!callPath) {
          return
        }
        const matchBlock = block.some(item => {
          if (item.endsWith('*')) {
            return callPath.startsWith(item.replace(/\*$/, ''))
          }
          return callPath.startsWith(`${item}.`)
        })
        if (!matchBlock) {
          return
        }

        const sourceCode = context.sourceCode
        const accessToken = sourceCode.getTokenBefore(node.property)
        const closingToken = node.computed
          ? sourceCode.getLastToken(node)
          : null
        const canFix =
          accessToken?.value === '.' ||
          accessToken?.value === '?.' ||
          (accessToken?.value === '[' && closingToken?.value === ']')

        context.report({
          node: node.property,
          messageId: 'unexpected',
          data: {
            type: callPath,
          },
          fix(fixer) {
            if (fix && canFix) {
              // Keep the optional token only when it becomes an optional call.
              // Other uses need a manual rewrite to preserve short-circuiting.
              if (
                node.optional &&
                (node.parent.type !== 'CallExpression' ||
                  node.parent.callee !== node ||
                  node.parent.optional)
              ) {
                return null
              }
              return [
                ...(accessToken.value === '?.' && node.optional
                  ? []
                  : [fixer.remove(accessToken)]),
                fixer.remove(node.property),
                ...(closingToken ? [fixer.remove(closingToken)] : []),
              ]
            }
            return null
          },
        })
      },
    }
  },
})
