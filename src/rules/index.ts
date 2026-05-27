import noDuplicateExports from './no-duplicate-exports'
import noMemberAccessibility from './no-member-accessibility'
import noOnlyTests from './no-only-tests'
import preferNewlineAfterFileHeader from './prefer-newline-after-file-header'

// @keep-sorted
export const rules = {
  'no-duplicate-exports': noDuplicateExports,
  'no-member-accessibility': noMemberAccessibility,
  'no-only-tests': noOnlyTests,
  'prefer-newline-after-file-header': preferNewlineAfterFileHeader,
}
