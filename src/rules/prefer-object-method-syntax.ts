import { ASTUtils } from '@typescript-eslint/utils'
import { createESLintRule } from '../utils'
import { createLexicalBindingTracker } from './prefer-object-method-syntax/createLexicalBindingTracker'
import { getMethodReplacement } from './prefer-object-method-syntax/getMethodReplacement'
import type { Tree } from '../eslint'

export const RULE_NAME = 'prefer-object-method-syntax'

export type MessageIds =
  | 'convertToMethod'
  | 'convertToMethodUnconstructible'
  | 'preferMethodSyntax'
  | 'preserveLexicalBindings'
export type Options = [
  {
    /**
     * Which arrow functions are allowed as object property values. Use
     * `singleLineOnly` to allow only single-line arrow functions.
     *
     * @default false
     */
    allowArrowFunctions?: boolean | 'singleLineOnly'
    /**
     * Static property names excluded from this rule.
     *
     * @default []
     */
    allowedPropertyNames?: string[]
    /**
     * Ignore string literal property keys, matching `object-shorthand`'s
     * `avoidQuotes` option.
     *
     * @default false
     */
    avoidQuotes?: boolean
    /**
     * Whether safe automatic fixes are enabled.
     *
     * @default false
     */
    fix?: boolean
  },
]

const defaultOptions: Options[0] = {
  allowArrowFunctions: false,
  allowedPropertyNames: [],
  avoidQuotes: false,
  fix: false,
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      recommended: false,
      description:
        'require method syntax for inline functions in object literals',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allowArrowFunctions: {
            anyOf: [
              {
                type: 'boolean',
              },
              {
                type: 'string',
                enum: ['singleLineOnly'],
              },
            ],
            description:
              'Whether all or only single-line arrow functions are allowed as object property values',
          },
          allowedPropertyNames: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
            description: 'Static property names excluded from this rule',
          },
          avoidQuotes: {
            type: 'boolean',
            description: 'Whether string literal property keys are ignored',
          },
          fix: {
            type: 'boolean',
            description: 'Whether safe automatic fixes are enabled',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [defaultOptions],
    messages: {
      convertToMethod: "Convert '{{propertyName}}' to object method syntax.",
      convertToMethodUnconstructible:
        "Convert '{{propertyName}}' to object method syntax; the result will not be constructible.",
      preferMethodSyntax: "Prefer object method syntax for '{{propertyName}}'.",
      preserveLexicalBindings:
        "Avoid an inline arrow function for '{{propertyName}}'; move it outside the object to preserve lexical bindings.",
    },
  },
  create(
    context,
    [
      {
        allowArrowFunctions = false,
        allowedPropertyNames = [],
        avoidQuotes = false,
        fix = false,
      },
    ],
  ) {
    const sourceCode = context.sourceCode
    const lexicalBindings = createLexicalBindingTracker(sourceCode)

    /**
     * Resolves a readable property name for diagnostics.
     *
     * @param node - The object property being reported
     * @returns The static property name or source text for a dynamic key
     */
    function getPropertyName(node: Tree.Property) {
      const propertyName = ASTUtils.getPropertyName(node)
      if (propertyName != null) {
        return propertyName
      }
      const keyText = sourceCode.getText(node.key)
      return node.computed ? `[${keyText}]` : keyText
    }

    /**
     * Reports a disallowed inline function and attaches only safe fixes or
     * explicitly risky suggestions.
     *
     * @param node - The object property to inspect
     * @remarks Returns no value
     */
    function reportProperty(node: Tree.Property) {
      // Only plain object properties are candidates; accessors use their own
      // syntax.
      if (
        node.parent.type !== 'ObjectExpression' ||
        node.kind !== 'init' ||
        node.method
      ) {
        return
      }
      const value = node.value
      if (
        value.type !== 'FunctionExpression' &&
        value.type !== 'ArrowFunctionExpression'
      ) {
        return
      }
      if (
        value.type === 'ArrowFunctionExpression' &&
        (allowArrowFunctions === true ||
          (allowArrowFunctions === 'singleLineOnly' &&
            value.loc.start.line === value.loc.end.line))
      ) {
        return
      }

      // Match `object-shorthand` so its `avoidQuotes` fixer cannot undo ours.
      if (
        avoidQuotes &&
        node.key.type === 'Literal' &&
        typeof node.key.value === 'string'
      ) {
        return
      }

      const staticPropertyName = ASTUtils.getPropertyName(node)
      if (
        staticPropertyName != null &&
        allowedPropertyNames.includes(staticPropertyName)
      ) {
        return
      }

      // Non-computed `__proto__` sets the prototype instead of defining a
      // method.
      if (staticPropertyName === '__proto__' && !node.computed) {
        return
      }

      const propertyName = getPropertyName(node)
      const hasLexicalBindings =
        value.type === 'ArrowFunctionExpression' &&
        lexicalBindings.hasLexicalBindings(value)

      // Converting this arrow would rebind its lexical runtime values.
      if (hasLexicalBindings) {
        context.report({
          node: value,
          messageId: 'preserveLexicalBindings',
          data: {
            propertyName,
          },
        })
        return
      }

      const replacement = getMethodReplacement(sourceCode, node)

      // Ordinary functions are constructible; object methods are not.
      const isConstructibleFunction =
        value.type === 'FunctionExpression' &&
        !value.async &&
        !value.generator &&
        !value.id
      const canAutoFix =
        replacement != null &&
        !isConstructibleFunction &&
        (value.type !== 'FunctionExpression' || !value.id)

      context.report({
        node: value,
        messageId: 'preferMethodSyntax',
        data: {
          propertyName,
        },
        fix:
          fix && canAutoFix
            ? fixer => fixer.replaceText(node, replacement)
            : undefined,
        suggest:
          replacement != null && (!fix || !canAutoFix)
            ? [
                {
                  messageId: isConstructibleFunction
                    ? 'convertToMethodUnconstructible'
                    : 'convertToMethod',
                  data: {
                    propertyName,
                  },
                  fix: fixer => fixer.replaceText(node, replacement),
                },
              ]
            : undefined,
      })
    }

    return {
      ...lexicalBindings.listeners,
      'Property:exit': reportProperty,
    }
  },
})
