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

  if (
    node.type === 'MemberExpression' &&
    !node.computed &&
    node.property.type === 'Identifier'
  ) {
    return node.property.name
  }

  return undefined
}

function getCallPath(node: Tree.Node, path: string[] = []) {
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

  return path
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
      Identifier(node) {
        if (functions.length && functions.includes(node.name)) {
          context.report({
            node,
            messageId: 'unexpected',
            data: {
              type: node.name,
            },
          })
        }

        const parent = node.parent
        if (!parent || !isMemberExpression(parent)) {
          return
        }
        if (parent.computed || parent.property !== node) {
          return
        }
        if (!focus.includes(node.name)) {
          return
        }

        const callPath = getCallPath(parent).join('.')
        const matchBlock = block.find(item => {
          if (item.endsWith('*')) {
            return callPath.startsWith(item.replace(/\*$/, ''))
          }
          return callPath.startsWith(`${item}.`)
        })
        if (!matchBlock) {
          return
        }

        const rangeStart = node.range?.[0]
        const rangeEnd = node.range?.[1]

        context.report({
          node,
          messageId: 'unexpected',
          data: {
            type: callPath,
          },
          fix:
            fix && rangeStart != null && rangeEnd != null
              ? fixer => fixer.removeRange([rangeStart - 1, rangeEnd])
              : undefined,
        })
      },
    }
  },
})
