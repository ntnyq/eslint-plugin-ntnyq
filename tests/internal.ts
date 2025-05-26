import parserTypeScript from '@typescript-eslint/parser'
import { run as _run } from 'eslint-vitest-rule-tester'
import type {
  RuleTesterInitOptions,
  TestCasesOptions,
} from 'eslint-vitest-rule-tester'

export { unindent as $ } from 'eslint-vitest-rule-tester'

export function run<TOptions = any>(
  options: RuleTesterInitOptions & TestCasesOptions,
) {
  return _run<TOptions>({
    languageOptions: {
      parser: parserTypeScript,
    },
    ...options,
  })
}
