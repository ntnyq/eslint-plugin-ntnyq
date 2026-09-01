import { ASTUtils } from '@typescript-eslint/utils'
import { createESLintRule, resolveOptions } from '../utils'
import type { Tree } from '../types'

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
  create(context) {
    const {
      allowArrowFunctions = false,
      allowedPropertyNames = [],
      fix = false,
    } = resolveOptions(context.options, defaultOptions)
    const sourceCode = context.sourceCode
    const lexicalScopeStack: Set<Tree.ArrowFunctionExpression>[] = []
    const arrowsWithLexicalBindings =
      new WeakSet<Tree.ArrowFunctionExpression>()
    const argumentsIdentifiers = new WeakSet<Tree.Identifier>()

    /**
     * Opens a lexical scope for a program or non-arrow function and records the
     * `arguments` references owned by that scope.
     *
     * @param node - The node that establishes the lexical scope
     * @remarks Returns no value
     */
    function enterFunction(
      node: Tree.FunctionDeclaration | Tree.FunctionExpression | Tree.Program,
    ) {
      lexicalScopeStack.unshift(new Set())
      const scope = sourceCode.getScope(node)

      // Arrow functions inherit the nearest non-arrow function's `arguments`.
      scope.variables
        .filter(variable => variable.name === 'arguments')
        .forEach(variable => {
          variable.references.forEach(reference => {
            if (reference.identifier.type === 'Identifier') {
              argumentsIdentifiers.add(reference.identifier)
            }
          })
        })

      // An unresolved top-level `arguments` would become a method-local binding.
      if (node.type === 'Program') {
        scope.through.forEach(reference => {
          if (
            reference.identifier.type === 'Identifier' &&
            reference.identifier.name === 'arguments'
          ) {
            argumentsIdentifiers.add(reference.identifier)
          }
        })
      }
    }

    /**
     * Closes the current program or non-arrow function lexical scope.
     *
     * @remarks Returns no value
     */
    function exitFunction() {
      lexicalScopeStack.shift()
    }

    /**
     * Stops tracking an arrow after its body has been traversed.
     *
     * @param node - The arrow function being exited
     * @remarks Returns no value
     */
    function exitArrowFunction(node: Tree.ArrowFunctionExpression) {
      lexicalScopeStack[0]?.delete(node)
    }

    /**
     * Marks every active arrow in the current lexical scope as unsafe to
     * convert to a method.
     *
     * @remarks Returns no value
     */
    function markLexicalBinding() {
      lexicalScopeStack[0]?.forEach(arrowFunction => {
        arrowsWithLexicalBindings.add(arrowFunction)
      })
    }

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
     * Builds the equivalent object method source for a fixable property.
     *
     * @param node - The object property to convert
     * @returns Replacement source, or `undefined` when conversion is unsafe
     */
    function getMethodReplacement(node: Tree.Property) {
      const value = node.value
      if (
        value.type !== 'FunctionExpression' &&
        value.type !== 'ArrowFunctionExpression'
      ) {
        return
      }

      // Method syntax cannot preserve a named function's inner binding.
      if (value.type === 'FunctionExpression' && value.id) {
        return
      }

      // Single-line expression arrows stay unchanged. Multi-line expressions
      // can be converted by introducing an explicit return statement.
      if (
        value.type === 'ArrowFunctionExpression' &&
        value.body.type !== 'BlockStatement' &&
        value.loc.start.line === value.loc.end.line
      ) {
        return
      }

      const firstKeyToken = sourceCode.getFirstToken(node)
      const colonToken = sourceCode.getTokenBefore(value)
      if (!firstKeyToken || !colonToken || colonToken.value !== ':') {
        return
      }
      const lastKeyToken = sourceCode.getTokenBefore(colonToken)

      // Replacing the whole property must not discard key/value comments.
      if (
        !lastKeyToken ||
        sourceCode.commentsExistBetween(lastKeyToken, value)
      ) {
        return
      }

      const keyText = sourceCode.text.slice(
        firstKeyToken.range[0],
        lastKeyToken.range[1],
      )
      const methodPrefix = `${value.async ? 'async ' : ''}${
        value.generator ? '*' : ''
      }${keyText}`

      if (value.type === 'FunctionExpression') {
        const valueTokens = sourceCode.getTokens(value)
        const firstValueToken = valueTokens[0]
        const functionToken = valueTokens.find(
          token => token.value === 'function',
        )
        if (!firstValueToken || !functionToken) {
          return
        }

        // Modifier comments have no unambiguous position in method syntax.
        if (
          firstValueToken !== functionToken &&
          sourceCode.commentsExistBetween(firstValueToken, functionToken)
        ) {
          return
        }
        const tokenBeforeParameters = value.generator
          ? sourceCode.getTokenAfter(functionToken)
          : functionToken
        if (!tokenBeforeParameters) {
          return
        }

        // Keep comments attached to a generator star instead of relocating
        // them.
        if (
          value.generator &&
          sourceCode.commentsExistBetween(functionToken, tokenBeforeParameters)
        ) {
          return
        }
        return (
          methodPrefix +
          sourceCode.text
            .slice(tokenBeforeParameters.range[1], value.range[1])
            .trimStart()
        )
      }

      const arrowToken = sourceCode.getTokenBefore(
        value.body,
        token => token.value === '=>',
      )
      const firstArrowToken = sourceCode.getFirstToken(value)
      const firstParameterToken = sourceCode.getFirstToken(value, {
        skip: value.async ? 1 : 0,
      })
      const tokenBeforeArrow = arrowToken
        ? sourceCode.getTokenBefore(arrowToken)
        : null

      // A comment immediately before `=>` would be lost by replacement.
      if (
        !arrowToken ||
        !firstArrowToken ||
        !firstParameterToken ||
        !tokenBeforeArrow ||
        sourceCode.commentsExistBetween(tokenBeforeArrow, arrowToken)
      ) {
        return
      }

      // Preserve comments between `async` and the parameter list.
      if (
        value.async &&
        sourceCode.commentsExistBetween(firstArrowToken, firstParameterToken)
      ) {
        return
      }

      const parameterText = sourceCode.text.slice(
        firstParameterToken.range[0],
        tokenBeforeArrow.range[1],
      )

      // A concise arrow parameter needs parentheses in method syntax.
      const needsParentheses =
        value.params.length === 1 &&
        value.params[0]?.range[0] === firstParameterToken.range[0]
      const normalizedParameterText = needsParentheses
        ? `(${parameterText})`
        : parameterText
      const bodyText = sourceCode.text.slice(
        arrowToken.range[1],
        value.range[1],
      )
      if (value.body.type === 'BlockStatement') {
        return methodPrefix + normalizedParameterText + bodyText
      }

      const firstTokenAfterValue = sourceCode.getTokenAfter(value, {
        includeComments: true,
      })
      const firstCodeTokenAfterValue = sourceCode.getTokenAfter(value)

      // Adding the method's closing brace would relocate a trailing comment.
      if (firstTokenAfterValue !== firstCodeTokenAfterValue) {
        return
      }

      const textBeforeExpression = sourceCode.text.slice(
        arrowToken.range[1],
        value.body.range[0],
      )
      const expressionText = sourceCode.text.slice(
        value.body.range[0],
        value.range[1],
      )
      const linebreak = textBeforeExpression.match(/\r\n|[\n\r]/u)?.[0]

      if (!linebreak) {
        return `${methodPrefix}${normalizedParameterText} {${
          textBeforeExpression || ' '
        }return ${expressionText} }`
      }

      const propertyLineStart =
        firstKeyToken.range[0] - firstKeyToken.loc.start.column
      const propertyLinePrefix = sourceCode.text.slice(
        propertyLineStart,
        firstKeyToken.range[0],
      )
      const propertyIndent = /^\s*$/u.test(propertyLinePrefix)
        ? propertyLinePrefix
        : ' '.repeat(firstKeyToken.loc.start.column)

      return `${methodPrefix}${normalizedParameterText} {${textBeforeExpression}return ${expressionText}${linebreak}${propertyIndent}}`
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
        arrowsWithLexicalBindings.has(value)

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

      const replacement = getMethodReplacement(node)

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
      Program: enterFunction,
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      'Program:exit': exitFunction,
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,

      /**
       * Tracks an arrow while traversing its lexical scope.
       *
       * @param node - The arrow function being entered
       * @remarks Returns no value
       */
      ArrowFunctionExpression(node) {
        lexicalScopeStack[0]?.add(node)
      },

      'ArrowFunctionExpression:exit': exitArrowFunction,
      ThisExpression: markLexicalBinding,
      Super: markLexicalBinding,

      /**
       * Detects lexical `new.target` usage inside active arrows.
       *
       * @param node - The meta property being inspected
       * @remarks Returns no value
       */
      MetaProperty(node) {
        if (node.meta.name === 'new' && node.property.name === 'target') {
          markLexicalBinding()
        }
      },

      /**
       * Detects direct eval calls that may access lexical bindings dynamically.
       *
       * @param node - The call expression being inspected
       * @remarks Returns no value
       */
      CallExpression(node) {
        // Optional eval calls are indirect and cannot access the local scope.
        if (
          !node.optional &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'eval'
        ) {
          markLexicalBinding()
        }
      },

      /**
       * Detects references to an inherited or unresolved `arguments` binding.
       *
       * @param node - The identifier being inspected
       * @remarks Returns no value
       */
      Identifier(node) {
        if (argumentsIdentifiers.has(node)) {
          markLexicalBinding()
        }
      },
      'Property:exit': reportProperty,
    }
  },
})
