import { ASTUtils } from '@typescript-eslint/utils'
import { createESLintRule } from '../utils'
import type { CodePath } from '@typescript-eslint/utils/ts-eslint'
import type { RuleListener, Tree } from '../types'

export const RULE_NAME = 'no-explicit-void-return-type'
export type MessageIds = 'noExplicitVoidReturnType' | 'removeReturnType'
export type Options = []

type FunctionNode =
  | Tree.ArrowFunctionExpression
  | Tree.FunctionDeclaration
  | Tree.FunctionExpression

type ReturnTypeKind = 'promiseVoid' | 'void'

interface FunctionState {
  hasValueReturn: boolean
  node: FunctionNode
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      recommended: false,
      description:
        'disallow explicit void return types on function implementations',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      noExplicitVoidReturnType:
        'Avoid the explicit `{{returnType}}` return type on function implementations.',
      removeReturnType:
        'Remove the explicit `{{returnType}}` return type; TypeScript may infer a different type.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    const functionStack: FunctionState[] = []

    /**
     * Identifies the exact return annotations handled by this rule.
     *
     * @param node - The function implementation to inspect
     * @returns The matched annotation kind, or `undefined` for other types
     */
    function getReturnTypeKind(node: FunctionNode): ReturnTypeKind | undefined {
      const returnType = node.returnType?.typeAnnotation
      if (returnType?.type === 'TSVoidKeyword') {
        return 'void'
      }
      if (
        returnType?.type === 'TSTypeReference' &&
        returnType.typeName.type === 'Identifier' &&
        returnType.typeName.name === 'Promise' &&
        returnType.typeArguments?.params.length === 1 &&
        returnType.typeArguments.params[0]?.type === 'TSVoidKeyword'
      ) {
        return 'promiseVoid'
      }
    }

    /**
     * Reports an explicit void return annotation and attaches a fix only when
     * removing it preserves the return type inferred from the implementation.
     *
     * @param codePath - The completed ESLint code path for the function
     * @param state - Traversal state collected for the function
     * @remarks Returns no value
     */
    function reportFunction(codePath: CodePath, state: FunctionState) {
      const { node } = state
      const returnType = node.returnType
      const returnTypeKind = getReturnTypeKind(node)
      if (!returnType || !returnTypeKind) {
        return
      }

      const returnTypeText =
        returnTypeKind === 'promiseVoid' ? 'Promise<void>' : 'void'
      const hasAnnotationComments =
        sourceCode.getCommentsInside(returnType).length > 0
      const hasReachableReturn = codePath.returnedSegments.some(
        segment => segment.reachable,
      )
      const hasMatchingFunctionKind =
        returnTypeKind === 'promiseVoid' ? node.async : !node.async
      const canAutoFix =
        node.body.type === 'BlockStatement' &&
        !node.generator &&
        !state.hasValueReturn &&
        hasReachableReturn &&
        hasMatchingFunctionKind &&
        !hasAnnotationComments

      context.report({
        node: returnType,
        messageId: 'noExplicitVoidReturnType',
        data: {
          returnType: returnTypeText,
        },
        fix: canAutoFix ? fixer => fixer.remove(returnType) : undefined,
        suggest:
          !canAutoFix && !hasAnnotationComments
            ? [
                {
                  messageId: 'removeReturnType',
                  data: {
                    returnType: returnTypeText,
                  },
                  fix: fixer => fixer.remove(returnType),
                },
              ]
            : undefined,
      })
    }

    function onCodePathStart(codePath: CodePath, node: Tree.Node) {
      if (!ASTUtils.isFunction(node)) {
        return
      }
      functionStack.unshift({
        hasValueReturn: false,
        node,
      })
    }

    function onCodePathEnd(codePath: CodePath, node: Tree.Node) {
      if (!ASTUtils.isFunction(node)) {
        return
      }
      const state = functionStack.shift()
      /* v8 ignore start */
      if (!state || state.node !== node) {
        return
      }
      /* v8 ignore stop */
      reportFunction(codePath, state)
    }

    const listener = {
      onCodePathEnd,
      onCodePathStart,
      ReturnStatement(node: Tree.ReturnStatement) {
        if (node.argument) {
          const state = functionStack[0]
          if (state) {
            state.hasValueReturn = true
          }
        }
      },
    }

    // typescript-eslint omits code-path callbacks from RuleListener's index
    // signature even though ESLint exposes them to rules at runtime.
    return listener as unknown as RuleListener
  },
})
