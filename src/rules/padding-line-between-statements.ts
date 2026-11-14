import { createESLintRule } from '../utils'
import type { AST } from 'vue-eslint-parser'
import type { SourceCode, Tree } from '../eslint'

export const RULE_NAME = 'padding-line-between-statements'

const STATEMENT_TYPES = [
  '*',
  'block',
  'block-like',
  'break',
  'case',
  'cjs-export',
  'cjs-import',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'directive',
  'do',
  'empty',
  'export',
  'expression',
  'for',
  'function',
  'if',
  'iife',
  'import',
  'let',
  'multiline-block-like',
  'multiline-const',
  'multiline-expression',
  'multiline-let',
  'multiline-var',
  'return',
  'singleline-const',
  'singleline-let',
  'singleline-var',
  'switch',
  'throw',
  'try',
  'var',
  'while',
  'with',
] as const

export type StatementType = (typeof STATEMENT_TYPES)[number]
export interface PaddingConfig {
  blankLine: 'always' | 'never' | 'any'
  prev: StatementType | StatementType[]
  next: StatementType | StatementType[]
}
export type Options = PaddingConfig[]
export type MessageIds = 'expectedBlankLine' | 'unexpectedBlankLine'

type TokenOrComment = Tree.Token | Tree.Comment
type PaddingGap = [TokenOrComment, TokenOrComment]

function isDirective(node: Tree.Node): boolean {
  return (
    node.type === 'ExpressionStatement' &&
    'directive' in node &&
    typeof node.directive === 'string'
  )
}

function isIIFE(node: Tree.Node): boolean {
  if (node.type !== 'ExpressionStatement') {
    return false
  }

  let expression = node.expression

  if (expression.type === 'ChainExpression') {
    expression = expression.expression
  }

  if (expression.type === 'UnaryExpression') {
    expression = expression.argument
  }

  if (expression.type === 'ChainExpression') {
    expression = expression.expression
  }

  return (
    expression.type === 'CallExpression' &&
    (expression.callee.type === 'FunctionExpression' ||
      expression.callee.type === 'ArrowFunctionExpression')
  )
}

function isBlockLike(node: Tree.Node, sourceCode: SourceCode): boolean {
  if (
    (node.type === 'DoWhileStatement' && node.body.type === 'BlockStatement') ||
    isIIFE(node)
  ) {
    return true
  }

  const lastToken = sourceCode.getLastToken(node, token => token.value !== ';')
  const owner =
    lastToken?.value === '}'
      ? sourceCode.getNodeByRangeIndex(lastToken.range[0])
      : null

  return owner?.type === 'BlockStatement' || owner?.type === 'SwitchStatement'
}

function matchesStatement(
  node: Tree.Node,
  selector: PaddingConfig['prev'],
  sourceCode: SourceCode,
): boolean {
  if (node.type === 'LabeledStatement') {
    return matchesStatement(node.body, selector, sourceCode)
  }

  if (Array.isArray(selector)) {
    return selector.some(type => matchesStatement(node, type, sourceCode))
  }

  const isMultiline = node.loc.start.line !== node.loc.end.line

  switch (selector) {
    case '*':
      return true
    case 'block':
      return node.type === 'BlockStatement'
    case 'empty':
      return node.type === 'EmptyStatement'
    case 'function':
      return node.type === 'FunctionDeclaration'
    case 'block-like':
      return isBlockLike(node, sourceCode)
    case 'multiline-block-like':
      return isMultiline && isBlockLike(node, sourceCode)
    case 'directive':
      return isDirective(node)
    case 'expression':
    case 'multiline-expression':
      return (
        node.type === 'ExpressionStatement' &&
        !isDirective(node) &&
        (selector === 'expression' || isMultiline)
      )
    case 'iife':
      return isIIFE(node)
    case 'cjs-export':
      return (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'AssignmentExpression' &&
        /^(?:module\s*\.\s*)?exports(?:\s*\.|\s*\[|$)/u.test(
          sourceCode.getText(node.expression.left),
        )
      )
    case 'cjs-import': {
      const first =
        node.type === 'VariableDeclaration' ? node.declarations[0] : undefined

      return Boolean(
        first?.init && /^require\(/u.test(sourceCode.getText(first.init)),
      )
    }
    case 'break':
    case 'case':
    case 'class':
    case 'const':
    case 'continue':
    case 'debugger':
    case 'default':
    case 'do':
    case 'export':
    case 'for':
    case 'if':
    case 'import':
    case 'let':
    case 'return':
    case 'switch':
    case 'throw':
    case 'try':
    case 'var':
    case 'while':
    case 'with':
    case 'multiline-const':
    case 'multiline-let':
    case 'multiline-var':
    case 'singleline-const':
    case 'singleline-let':
    case 'singleline-var': {
      const keyword = sourceCode.getFirstToken(node)?.value

      if (selector.startsWith('multiline-')) {
        return isMultiline && keyword === selector.slice('multiline-'.length)
      }

      if (selector.startsWith('singleline-')) {
        return !isMultiline && keyword === selector.slice('singleline-'.length)
      }

      return keyword === selector
    }
  }
}

/**
 * A leading ASI protection semicolon belongs to the preceding AST statement.
 * Keep it attached to the expression on its own line when changing padding.
 */
function getLastStatementToken(node: Tree.Node, sourceCode: SourceCode) {
  const last = sourceCode.getLastToken(node)

  if (!last || last.value !== ';') {
    return last
  }

  const before = sourceCode.getTokenBefore(last)
  const after = sourceCode.getTokenAfter(last)

  return before &&
    after &&
    before.range[0] >= node.range[0] &&
    before.loc.end.line !== last.loc.start.line &&
    last.loc.end.line === after.loc.start.line
    ? before
    : last
}

/**
 * Comments separate whitespace gaps; newlines inside comments are not padding.
 */
function getPaddingGaps(
  previous: TokenOrComment,
  next: Tree.Node,
  sourceCode: SourceCode,
): PaddingGap[] {
  const gaps: PaddingGap[] = []
  let left = previous

  while (left.range[0] < next.range[0]) {
    const right = sourceCode.getTokenAfter(left, { includeComments: true })

    if (!right) {
      break
    }

    if (right.loc.start.line - left.loc.end.line > 1) {
      gaps.push([left, right])
    }

    left = right
  }

  return gaps
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      recommended: false,
      description: 'require or disallow padding lines between statements',
    },
    fixable: 'whitespace',
    schema: {
      type: 'array',
      definitions: {
        statementType: {
          anyOf: [
            { type: 'string', enum: [...STATEMENT_TYPES] },
            {
              type: 'array',
              items: { type: 'string', enum: [...STATEMENT_TYPES] },
              minItems: 1,
              uniqueItems: true,
            },
          ],
        },
      },
      items: {
        type: 'object',
        properties: {
          blankLine: { type: 'string', enum: ['always', 'never', 'any'] },
          prev: { $ref: '#/definitions/statementType' },
          next: { $ref: '#/definitions/statementType' },
        },
        required: ['blankLine', 'prev', 'next'],
        additionalProperties: false,
      },
    },
    defaultOptions: [],
    messages: {
      expectedBlankLine: 'Expected blank line before this statement.',
      unexpectedBlankLine: 'Unexpected blank line before this statement.',
    },
  },
  create(context, options) {
    if (!options.length) {
      return {}
    }

    const sourceCode = context.sourceCode
    const newline =
      sourceCode.text.match(/\r\n|[\n\r\u{2028}\u{2029}]/u)?.[0] ?? '\n'
    // Vue exposes document services in addition to TypeScript's parser services.
    const services = sourceCode.parserServices as
      | { getDocumentFragment?: () => AST.VDocumentFragment | null }
      | undefined
    const scripts = services
      ?.getDocumentFragment?.()
      ?.children.filter(
        element => element.type === 'VElement' && element.name === 'script',
      )

    function verifyStatements(statements: Tree.Node[]) {
      for (let index = 1; index < statements.length; index++) {
        const previous = statements[index - 1]
        const next = statements[index]

        // Vue merges both script blocks into one Program. Never pad across tags.
        if (
          scripts &&
          !scripts.some(
            script =>
              script.range[0] <= previous.range[0] &&
              next.range[1] <= script.range[1],
          )
        ) {
          continue
        }

        const config = options.findLast(
          config =>
            matchesStatement(previous, config.prev, sourceCode) &&
            matchesStatement(next, config.next, sourceCode),
        )

        if (!config || config.blankLine === 'any') {
          continue
        }

        const lastToken = getLastStatementToken(previous, sourceCode)

        if (!lastToken) {
          continue
        }

        const gaps = getPaddingGaps(lastToken, next, sourceCode)
        const shouldInsert = config.blankLine === 'always'

        if (shouldInsert === gaps.length > 0) {
          continue
        }

        context.report({
          node: next,
          messageId: shouldInsert ? 'expectedBlankLine' : 'unexpectedBlankLine',
          fix(fixer) {
            if (!shouldInsert) {
              // Preserve comment placement when several gaps surround comments.
              if (gaps.length !== 1) {
                return null
              }

              const [left, right] = gaps[0]
              const start = left.range[1]
              const end = right.range[0]
              const whitespace = sourceCode.text.slice(start, end)
              const linebreaks = [
                ...whitespace.matchAll(/\r\n|[\n\r\u{2028}\u{2029}]/gu),
              ]
              const first = linebreaks[0]
              const last = linebreaks.at(-1)

              if (!first || !last) {
                return null
              }

              const replacement =
                whitespace.slice(0, first.index + first[0].length) +
                whitespace.slice(last.index + last[0].length)

              return fixer.replaceTextRange([start, end], replacement)
            }

            let left: TokenOrComment = lastToken
            let right = sourceCode.getTokenAfter(left, {
              includeComments: true,
            })

            // Keep trailing comments on the same line as their statement.
            while (
              right &&
              right.range[0] < next.range[0] &&
              right.loc.start.line === left.loc.end.line
            ) {
              left = right
              right = sourceCode.getTokenAfter(left, { includeComments: true })
            }

            const count =
              left.loc.end.line === (right ?? next).loc.start.line ? 2 : 1

            return fixer.insertTextAfter(left, newline.repeat(count))
          },
        })
      }
    }

    return {
      Program: node => verifyStatements(node.body),
      BlockStatement: node => verifyStatements(node.body),
      StaticBlock: node => verifyStatements(node.body),
      SwitchStatement: node => verifyStatements(node.cases),
      SwitchCase: node => verifyStatements(node.consequent),
      TSModuleBlock: node => verifyStatements(node.body),
    }
  },
})
