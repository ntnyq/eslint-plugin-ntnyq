import indentUnindent from './indent-unindent'
import noDuplicateExports from './no-duplicate-exports'
import noExplicitVoidReturnType from './no-explicit-void-return-type'
import noMemberAccessibility from './no-member-accessibility'
import noRestrictedBindings from './no-restricted-bindings'
import paddingLineBetweenStatements from './padding-line-between-statements'
import preferNewlineAfterFileHeader from './prefer-newline-after-file-header'
import preferObjectMethodSyntax from './prefer-object-method-syntax'
import returnObjectMultiline from './return-object-multiline'

// @keep-sorted
export const rules = {
  'indent-unindent': indentUnindent,
  'no-duplicate-exports': noDuplicateExports,
  'no-explicit-void-return-type': noExplicitVoidReturnType,
  'no-member-accessibility': noMemberAccessibility,
  'no-restricted-bindings': noRestrictedBindings,
  'padding-line-between-statements': paddingLineBetweenStatements,
  'prefer-newline-after-file-header': preferNewlineAfterFileHeader,
  'prefer-object-method-syntax': preferObjectMethodSyntax,
  'return-object-multiline': returnObjectMultiline,
}
