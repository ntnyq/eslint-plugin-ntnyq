import { join } from '@ntnyq/utils'
import { PROGRAM_EXIT, SPECIAL_CHAR } from '../constants'
import { AST_NODE_TYPES } from '../types'
import { createESLintRule, resolveOptions } from '../utils'
import type { Tree } from '../types'

const EXPORT_STYLE = {
  inline: 'inline',
  separate: 'separate',
} as const
const EXPORT_TYPE = 'type'

type AllowedExportStyle = keyof typeof EXPORT_STYLE

export const RULE_NAME = 'no-duplicate-exports'
export type MessageIds = 'multiSameExportAll' | 'multiSameSourceNamed'
export type Options = [
  {
    /**
     * types export style
     *
     * @default `separate`
     */
    style?: AllowedExportStyle
  },
]

const defaultOptions: Options[0] = {
  style: EXPORT_STYLE.separate,
}

function getIdentifierOrStringLiteralValue(
  node: Tree.Identifier | Tree.StringLiteral,
) {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return node.name
  }
  // AST_NODE_TYPES.StringLiteral
  return node.raw
}

function toExportAllStatement(key: string) {
  const [source, kind, name = ''] = key.split(SPECIAL_CHAR.colon)

  return join(
    [
      'export',
      kind === EXPORT_TYPE ? EXPORT_TYPE : '',
      '*',
      ...(name ? ['as', name] : []),
      'from',
      `"${source}"`,
    ],
    {
      separator: SPECIAL_CHAR.whitespace,
    },
  )
}

function toNamedExportNames(nodes: Tree.ExportNamedDeclarationWithSource[]) {
  const allNames = nodes.reduce<string[]>((names, node) => {
    return [
      ...names,
      ...node.specifiers.map(s => {
        const localName = getIdentifierOrStringLiteralValue(s.local)
        const exportedName = getIdentifierOrStringLiteralValue(s.exported)
        return join(
          [
            s.exportKind === 'type' ? 'type' : '',
            localName,
            ...(localName === exportedName ? [] : ['as', exportedName]),
          ],
          { separator: SPECIAL_CHAR.whitespace },
        )
      }),
    ]
  }, [])
  return join(allNames, {
    separator: SPECIAL_CHAR.comma + SPECIAL_CHAR.whitespace,
  })
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      recommended: true,
      description: 'disallow duplicate exports statement',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            description: 'The expected export kind for type-only exports',
            enum: [EXPORT_STYLE.inline, EXPORT_STYLE.separate],
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      multiSameExportAll: `Multiple same export all statement '{{statement}}'`,
      multiSameSourceNamed: `Multiple named export from same source '{{source}}'`,
    },
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const { style: namedExportStyle = EXPORT_STYLE.separate } = resolveOptions(
      context.options,
      defaultOptions,
    )
    const preferSeparateStyle = namedExportStyle === EXPORT_STYLE.separate

    function groupNodesByKey<T>(
      nodes: T[],
      getKey: (item: T) => string,
    ): Map<string, T[]> {
      return nodes.reduce((map, item) => {
        const key = getKey(item)
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)?.push(item)
        return map
      }, new Map<string, T[]>())
    }

    // Collect all export nodes
    const exportAllNodes: Tree.ExportAllDeclaration[] = []
    const namedExportNodes: Tree.ExportNamedDeclarationWithSource[] = []

    return {
      ExportNamedDeclaration(node) {
        if (node.source) {
          namedExportNodes.push(node)
        }
      },
      ExportAllDeclaration(node) {
        exportAllNodes.push(node)
      },
      [PROGRAM_EXIT]() {
        const exportAllKey = (node: Tree.ExportAllDeclaration) =>
          join([node.source.value, node.exportKind, node.exported?.name], {
            separator: SPECIAL_CHAR.colon,
          })
        const namedExportKey = (node: Tree.ExportNamedDeclarationWithSource) =>
          join(
            [node.source.value, preferSeparateStyle ? node.exportKind : ''],
            { separator: SPECIAL_CHAR.colon },
          )

        const seenExportAll = groupNodesByKey(exportAllNodes, exportAllKey)
        const seenNamedExport = groupNodesByKey(
          namedExportNodes,
          namedExportKey,
        )

        seenExportAll.forEach((nodes, key) => {
          if (nodes.length <= 1) {
            return
          }
          nodes.forEach((node, idx) => {
            context.report({
              messageId: 'multiSameExportAll',
              node,
              data: {
                statement: toExportAllStatement(key),
              },
              fix: idx === 0 ? undefined : fixer => fixer.remove(node),
            })
          })
        })

        seenNamedExport.forEach((nodes, key) => {
          if (nodes.length <= 1) {
            return
          }
          nodes.forEach((node, idx) => {
            context.report({
              messageId: 'multiSameSourceNamed',
              node,
              data: {
                source: node.source.value,
              },
              fix: fixer =>
                idx === 0
                  ? fixer.replaceText(
                      node,
                      join(
                        [
                          'export',
                          key.endsWith(EXPORT_TYPE) ? EXPORT_TYPE : '',
                          '{',
                          toNamedExportNames(nodes),
                          '}',
                          'from',
                          `'${node.source.value}'`,
                        ],
                        { separator: SPECIAL_CHAR.whitespace },
                      ),
                    )
                  : fixer.remove(node),
            })
          })
        })
      },
    }
  },
})
