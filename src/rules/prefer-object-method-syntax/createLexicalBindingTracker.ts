import type { RuleListener, SourceCode, Tree } from '../../eslint'

/**
 * Tracks arrow functions that inherit bindings changed by method conversion.
 */
export function createLexicalBindingTracker(sourceCode: SourceCode) {
  const lexicalScopeStack: Set<Tree.ArrowFunctionExpression>[] = []
  const arrowsWithLexicalBindings = new WeakSet<Tree.ArrowFunctionExpression>()

  /**
   * Opens a lexical scope for a program or non-arrow function.
   *
   * @remarks Returns no value
   */
  function enterFunction() {
    lexicalScopeStack.unshift(new Set())
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

  return {
    hasLexicalBindings(node: Tree.ArrowFunctionExpression): boolean {
      return arrowsWithLexicalBindings.has(node)
    },
    listeners: {
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

        // Through references are inherited from outside this arrow, including
        // block/catch bindings and unresolved globals named `arguments`.
        if (
          sourceCode
            .getScope(node)
            .through.some(
              reference =>
                reference.identifier.type === 'Identifier' &&
                reference.identifier.name === 'arguments',
            )
        ) {
          arrowsWithLexicalBindings.add(node)
        }
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
    } satisfies RuleListener,
  }
}
