import type { SourceCode, Tree } from '../../eslint'

/**
 * Builds the equivalent object method source for a fixable property.
 *
 * @param sourceCode - Source text and token access for the current file
 * @param node - The object property to convert
 * @returns Replacement source, or `undefined` when conversion is unsafe
 */
export function getMethodReplacement(
  sourceCode: SourceCode,
  node: Tree.Property,
): string | undefined {
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
  if (!lastKeyToken || sourceCode.commentsExistBetween(lastKeyToken, value)) {
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
    const functionToken = valueTokens.find(token => token.value === 'function')

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
  const bodyText = sourceCode.text.slice(arrowToken.range[1], value.range[1])

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

  // Expression node ranges omit wrapping parentheses. Keep those with the
  // expression so `return` precedes the opening parenthesis.
  const firstExpressionToken = sourceCode.getTokenAfter(arrowToken)

  if (!firstExpressionToken) {
    return
  }

  const textBeforeExpression = sourceCode.text.slice(
    arrowToken.range[1],
    firstExpressionToken.range[0],
  )
  const expressionText = sourceCode.text.slice(
    firstExpressionToken.range[0],
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
