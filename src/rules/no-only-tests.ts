import { createESLintRule, resolveOptions } from '../utils'

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
  block: [],
  focus: [],
  functions: [],
  fix: false,
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
      unexpected: 'Unexpected {{type}} block',
    },
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const {
      block = [],
      focus = [],
      functions = [],
      fix = false,
    } = resolveOptions(context.options, defaultOptions)
    console.log({
      block,
      focus,
      functions,
      fix,
    })
    return {
      Identifier(node) {
        return context.report({
          node,
          messageId: 'unexpected',
          data: {
            type: node.name,
          },
          fix: fix
            ? fixer => {
                // If fix is enabled, remove the '.only' suffix
                return fixer.replaceText(node, node.name.replace(/\.only$/, ''))
              }
            : undefined,
        })
      },
    }
  },
})
