import noDuplicateExports from './no-duplicate-exports'
import noExplicitVoidReturnType from './no-explicit-void-return-type'
import noMemberAccessibility from './no-member-accessibility'
import noOnlyTests from './no-only-tests'
import preferNewlineAfterFileHeader from './prefer-newline-after-file-header'
import preferObjectMethodSyntax from './prefer-object-method-syntax'

// @keep-sorted
export const rules = {
  'no-duplicate-exports': noDuplicateExports,
  'no-explicit-void-return-type': noExplicitVoidReturnType,
  'no-member-accessibility': noMemberAccessibility,
  'no-only-tests': noOnlyTests,
  'prefer-newline-after-file-header': preferNewlineAfterFileHeader,
  'prefer-object-method-syntax': preferObjectMethodSyntax,
}
