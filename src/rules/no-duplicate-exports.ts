import { AST_NODE_TYPES } from '@typescript-eslint/utils'
import { PROGRAM_EXIT, SEPARATOR } from '../constants'
import { createESLintRule, join } from '../utils'
import type { Tree } from '../types'

enum ExportStyle {
  inline = 'inline',
  separate = 'separate',
}

const EXPORT_TYPE = 'type'

export const RULE_NAME = 'no-duplicate-exports'
export type MessageIds = 'multiSameExportAll' | 'multiSameSourceNamed'
export type Options = [
  {
    style: ExportStyle.separate
  },
]

const defaultOptions: Options[0] = {
  style: ExportStyle.separate,
}

function getIdentifierOrStringLiteralValue(node: Tree.Identifier | Tree.StringLiteral) {
  if (node?.type === AST_NODE_TYPES.Identifier) {
    return node.name
  }

  if (node?.type === AST_NODE_TYPES.Literal) {
    return node.value
  }

  return ''
}

function toExportAllStatement(key: string) {
  const [source, kind, name = ''] = key.split(SEPARATOR.colon)

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
      separator: SEPARATOR.whitespace,
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
          { separator: SEPARATOR.whitespace },
        )
      }),
    ]
  }, [])
  return join(allNames, { separator: SEPARATOR.comma + SEPARATOR.whitespace })
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
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            description: 'The expected export kind for type-only exports',
            enum: [ExportStyle.inline, ExportStyle.separate],
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
    const { style: namedExportStyle = ExportStyle.separate } =
      context.options?.[0] || defaultOptions
    const preferSeparateStyle = namedExportStyle === ExportStyle.separate

    const seenExportAll = new Map<string, Tree.ExportAllDeclaration[]>()
    const seenNamedExport = new Map<string, Tree.ExportNamedDeclarationWithSource[]>()

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

    function addNamedExportNode(node: Tree.ExportNamedDeclarationWithSource) {
      const key = join(
        [
          // from module
          node.source.value,

          // type or value when prefer separate
          preferSeparateStyle ? node.exportKind : '',
        ],
        {
          separator: SEPARATOR.colon,
        },
      )

      if (!seenNamedExport.has(key)) {
        seenNamedExport.set(key, [])
      }
      seenNamedExport.set(key, [...(seenNamedExport.get(key) || []), node])
    }

    return {
      ExportNamedDeclaration(node) {
        if (!node.source) return
        addNamedExportNode(node)
      },

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
              fix: fixer => {
                return idx === 0 ? null : fixer.remove(node)
              },
            })
          })
        }

        for (const [key, nodes] of seenNamedExport) {
          if (nodes.length === 0 || nodes.length === 1) {
            continue
          }

          nodes.forEach((node, idx) => {
            context.report({
              messageId: 'multiSameSourceNamed',
              node,
              data: {
                source: node.source.value,
              },
              fix: fixer => {
                const replaceText = join(
                  [
                    'export',
                    key.endsWith(EXPORT_TYPE) ? EXPORT_TYPE : '',
                    '{',
                    toNamedExportNames(nodes),
                    '}',
                    'from',
                    `'${node.source.value}'`,
                  ],
                  { separator: SEPARATOR.whitespace },
                )
                return idx === 0 ? fixer.replaceText(node, replaceText) : fixer.remove(node)
              },
            })
          })
        }
      },
    }
  },
})