import { createESLintRule, resolveOptions } from '../utils'
import type { Scope } from '@typescript-eslint/utils/ts-eslint'
import type { AST } from 'vue-eslint-parser'
import type { Tree } from '../types'

export type Region = 'script' | 'vue-script' | 'vue-script-setup'
export type BindingScope = 'top-level' | 'nested' | 'all'

export interface Restriction {
  names: string[]
  regions?: Region[]
  scope?: BindingScope
  except?: 'catch-parameter'[]
  message?: string
}

export const RULE_NAME = 'no-restricted-bindings'

export type MessageIds = 'restrictedBinding'

export type Options = [{ restrictions: Restriction[] }]

const defaultOptions: Options[0] = {
  restrictions: [],
}

interface ScriptRegion {
  region: Region
  range: Tree.Range
}

function isValueDefinition(definition: Scope.Definition) {
  // ESLint's own scope manager does not expose isVariableDefinition.
  if (
    'isVariableDefinition' in definition &&
    !definition.isVariableDefinition
  ) {
    return false
  }

  if (definition.type === 'ImportBinding') {
    return (
      definition.parent.importKind !== 'type' &&
      (!('importKind' in definition.node) ||
        definition.node.importKind !== 'type')
    )
  }

  if (definition.type === 'Parameter') {
    return (
      (definition.name.type !== 'Identifier' ||
        definition.name.name !== 'this') &&
      ![
        'TSFunctionType',
        'TSConstructorType',
        'TSCallSignatureDeclaration',
        'TSConstructSignatureDeclaration',
        'TSMethodSignature',
        'TSDeclareFunction',
        'TSEmptyBodyFunctionExpression',
      ].includes(definition.node.type)
    )
  }

  // Enum members are property names, not local declarations.
  return definition.type !== 'TSEnumMemberName'
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      recommended: false,
      description:
        'disallow specified binding names in selected regions and scopes',
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictions: {
            description:
              'Binding name restrictions, matched in configuration order',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                names: {
                  description:
                    'Exact, case-sensitive binding names to disallow',
                  type: 'array',
                  items: { type: 'string', minLength: 1 },
                  minItems: 1,
                  uniqueItems: true,
                },
                regions: {
                  description: 'Script regions in which to check declarations',
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['script', 'vue-script', 'vue-script-setup'],
                  },
                  minItems: 1,
                  uniqueItems: true,
                },
                scope: {
                  description: 'Lexical binding scope depth to check',
                  type: 'string',
                  enum: ['top-level', 'nested', 'all'],
                },
                except: {
                  description:
                    'Binding categories exempted from this restriction',
                  type: 'array',
                  items: { type: 'string', enum: ['catch-parameter'] },
                  uniqueItems: true,
                },
                message: {
                  description:
                    'Explanation appended to the standard diagnostic',
                  type: 'string',
                },
              },
              required: ['names'],
              additionalProperties: false,
            },
          },
        },
        required: ['restrictions'],
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      restrictedBinding:
        "Binding '{{name}}' is not allowed in the {{scope}} scope of {{region}}.{{message}}",
    },
  },
  create(context) {
    const { restrictions = [] } = resolveOptions(context.options)

    if (!restrictions.length) {
      return {}
    }

    const sourceCode = context.sourceCode
    // The shared context only types TypeScript services; Vue adds SFC services.
    const services = sourceCode.parserServices as
      | {
          getDocumentFragment?: () => AST.VDocumentFragment | null
        }
      | undefined
    const document = services?.getDocumentFragment?.()
    const scriptRegions: ScriptRegion[] = document
      ? document.children.flatMap(element => {
          if (element.type !== 'VElement' || element.name !== 'script') {
            return []
          }

          const isSetup = element.startTag.attributes.some(
            attribute => !attribute.directive && attribute.key.name === 'setup',
          )
          return [
            {
              region: isSetup ? 'vue-script-setup' : 'vue-script',
              range: element.range,
            },
          ]
        })
      : [
          {
            region: 'script',
            range: [0, sourceCode.text.length],
          },
        ]

    return {
      'Program:exit': function () {
        const reportedPositions = new Set<number>()

        for (const scope of sourceCode.scopeManager?.scopes ?? []) {
          // Both ordinary scripts and Vue's normalized script scopes use Program
          // as their root block. This also handles CommonJS wrapper scopes.
          const bindingScope =
            scope.block.type === 'Program' ? 'top-level' : 'nested'

          for (const variable of scope.variables) {
            for (const definition of variable.defs) {
              const identifier = definition.name
              if (
                identifier.type !== 'Identifier' ||
                reportedPositions.has(identifier.range[0]) ||
                !isValueDefinition(definition) ||
                // A class declaration's inner self-binding is the same source
                // declaration, not an additional nested declaration.
                (scope.type === 'class' &&
                  definition.node.type === 'ClassDeclaration')
              ) {
                continue
              }

              const region = scriptRegions.find(
                script =>
                  identifier.range[0] >= script.range[0] &&
                  identifier.range[1] <= script.range[1],
              )?.region
              if (!region) {
                continue
              }

              const restriction = restrictions.find(
                item =>
                  item.names.includes(identifier.name) &&
                  (!item.regions || item.regions.includes(region)) &&
                  (item.scope === 'all' ||
                    (item.scope ?? 'top-level') === bindingScope) &&
                  (definition.type !== 'CatchClause' ||
                    !item.except?.includes('catch-parameter')),
              )
              if (!restriction) {
                continue
              }

              reportedPositions.add(identifier.range[0])
              context.report({
                // Typed identifiers can include the annotation in their range.
                node: sourceCode.getFirstToken(identifier) ?? identifier,
                messageId: 'restrictedBinding',
                data: {
                  name: identifier.name,
                  scope: bindingScope,
                  region,
                  message: restriction.message ? ` ${restriction.message}` : '',
                },
              })
            }
          }
        }
      },
    }
  },
})
