import { PROGRAM_EXIT, SEPARATOR } from '../constants'
import { createESLintRule, join } from '../utils'
import type { Tree } from '../types'

export const RULE_NAME = 'no-duplicate-exports'
export type MessageIds = 'multiSameExportAll'
// | 'multiSameModuleNamed'
export type Options = []

function toExportAllStatement(key: string) {
  const [source, kind, name = ''] = key.split(SEPARATOR.colon)

  return join(
    [
      'export',
      kind === 'type' ? 'type' : '',
      '*',
      ...(name ? ['as', name] : []),
      'from',
      `"${source}"`,
    ],
    {
      separator: SEPARATOR.whitespace,
    },
  )
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      recommended: false,
      description: 'disallow duplicate exports statement',
    },
    fixable: 'code',
    schema: [],
    messages: {
      multiSameExportAll: `Multiple same export all statement '{{statement}}'`,
      // multiSameModuleNamed: `Multiple named export from module '{{module}}'`,
    },
  },
  defaultOptions: [],
  create(context) {
    const seenExportAll = new Map<string, Tree.Node[]>()

    function addExportAllNode(node: Tree.ExportAllDeclaration) {
      const key = join(
        [
          // from module
          node.source.value,
          // type or value
          node.exportKind,
          // as name
          node.exported?.name,
        ],
        {
          separator: SEPARATOR.colon,
        },
      )

      if (!seenExportAll.has(key)) {
        seenExportAll.set(key, [])
      }
      seenExportAll.set(key, [...(seenExportAll.get(key) || []), node])
    }

    return {
      // TODO: support merged named exports
      // ExportNamedDeclaration(node) {
      // },

      ExportAllDeclaration(node) {
        addExportAllNode(node)
      },

      [PROGRAM_EXIT]() {
        for (const [key, nodes] of seenExportAll) {
          if (nodes.length === 0 || nodes.length === 1) {
            continue
          }

          nodes.forEach((node, idx) => {
            context.report({
              messageId: 'multiSameExportAll',
              node,
              data: {
                statement: toExportAllStatement(key),
              },
              fix: idx === 0 ? fixer => fixer.remove(node) : null,
            })
          })
        }
      },
    }
  },
})
