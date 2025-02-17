import parserTypeScript from '@typescript-eslint/parser'
import { run as _run } from 'eslint-vitest-rule-tester'
import type {
  RuleTesterInitOptions,
  TestCasesOptions,
} from 'eslint-vitest-rule-tester'

export { unindent as $ } from 'eslint-vitest-rule-tester'

export function run(options: TestCasesOptions & RuleTesterInitOptions) {
  return _run({
    languageOptions: {
      parser: parserTypeScript,
    },
    ...options,
  })
}
