import { joinNonEmptyValues } from '@ntnyq/utils'
import { AST_NODE_TYPES } from '../eslint'
import { createESLintRule } from '../utils'
import type { Tree } from '../eslint'

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

function getExportNameText(node: Tree.Identifier | Tree.StringLiteral) {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return node.name
  }
  // AST_NODE_TYPES.StringLiteral
  return node.raw
}

function toExportAllStatement(node: Tree.ExportAllDeclaration) {
  const name = node.exported ? getExportNameText(node.exported) : ''

  return joinNonEmptyValues(
    [
      'export',
      node.exportKind === EXPORT_TYPE ? EXPORT_TYPE : '',
      '*',
      ...(name ? ['as', name] : []),
      'from',
      JSON.stringify(node.source.value),
    ],
    {
      separator: ' ',
    },
  )
}

function getExportAllName(node: Tree.Identifier | Tree.StringLiteral | null) {
  return node?.type === AST_NODE_TYPES.Identifier ? node.name : node?.value
}

function formatExportSpecifiers(
  nodes: Tree.ExportNamedDeclarationWithSource[],
  outputExportKind: string,
) {
  const allNames = nodes.reduce<string[]>((names, node) => {
    return [
      ...names,
      ...node.specifiers.map(s => {
        const localName = getExportNameText(s.local)
        const exportedName = getExportNameText(s.exported)
        return joinNonEmptyValues(
          [
            outputExportKind !== EXPORT_TYPE &&
            (node.exportKind === EXPORT_TYPE || s.exportKind === EXPORT_TYPE)
              ? EXPORT_TYPE
              : '',
            localName,
            ...(localName === exportedName ? [] : ['as', exportedName]),
          ],
          { separator: ' ' },
        )
      }),
    ]
  }, [])
  return joinNonEmptyValues(allNames, {
    separator: ', ',
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
  create(context, [{ style: namedExportStyle = EXPORT_STYLE.separate }]) {
    const preferSeparateStyle = namedExportStyle === EXPORT_STYLE.separate

    function getSourceSuffix(
      node: Tree.ExportNamedDeclarationWithSource | Tree.ExportAllDeclaration,
    ): string {
      return context.sourceCode.text
        .slice(node.source.range[1], node.range[1])
        .replace(/;\s*$/u, '')
        .trim()
    }

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
      'Program:exit': function () {
        const exportAllKey = (node: Tree.ExportAllDeclaration) =>
          JSON.stringify([
            node.source.value,
            node.exportKind,
            getExportAllName(node.exported),
            getSourceSuffix(node),
          ])
        const namedExportKey = (node: Tree.ExportNamedDeclarationWithSource) =>
          JSON.stringify([
            node.source.value,
            preferSeparateStyle ? node.exportKind : '',
            getSourceSuffix(node),
          ])

        const seenExportAll = groupNodesByKey(exportAllNodes, exportAllKey)
        const seenNamedExport = groupNodesByKey(
          namedExportNodes,
          namedExportKey,
        )

        seenExportAll.forEach(nodes => {
          if (nodes.length <= 1) {
            return
          }
          nodes.forEach((node, idx) => {
            context.report({
              messageId: 'multiSameExportAll',
              node,
              data: {
                statement: toExportAllStatement(node),
              },
              fix:
                idx === 0 || context.sourceCode.getCommentsInside(node).length
                  ? undefined
                  : fixer => fixer.remove(node),
            })
          })
        })

        seenNamedExport.forEach(nodes => {
          if (nodes.length <= 1) {
            return
          }
          const canFix = nodes.every(
            node => context.sourceCode.getCommentsInside(node).length === 0,
          )
          // A type-only declaration is erased. Merge at the first runtime
          // declaration so side-effectful dependencies keep their order.
          const replacementNode =
            nodes.find(node => node.exportKind !== EXPORT_TYPE) ?? nodes[0]
          const outputExportKind = nodes.every(
            node => node.exportKind === EXPORT_TYPE,
          )
            ? EXPORT_TYPE
            : ''
          nodes.forEach(node => {
            const sourceSuffix = getSourceSuffix(node)
            context.report({
              messageId: 'multiSameSourceNamed',
              node,
              data: {
                source: node.source.value,
              },
              fix: canFix
                ? fixer =>
                    node === replacementNode
                      ? fixer.replaceText(
                          node,
                          joinNonEmptyValues(
                            [
                              'export',
                              outputExportKind,
                              '{',
                              formatExportSpecifiers(nodes, outputExportKind),
                              '}',
                              'from',
                              context.sourceCode.getText(node.source),
                              sourceSuffix,
                            ],
                            { separator: ' ' },
                          ),
                        )
                      : fixer.remove(node)
                : undefined,
            })
          })
        })
      },
    }
  },
})
