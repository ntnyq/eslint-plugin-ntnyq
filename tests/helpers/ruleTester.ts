import parserTypeScript from '@typescript-eslint/parser'
import { run as _run } from 'eslint-vitest-rule-tester'
import type {
  RuleTesterInitOptions,
  TestCasesOptions,
} from 'eslint-vitest-rule-tester'

export { unindent as $ } from 'eslint-vitest-rule-tester'

export async function runRuleTests<
  TOptions extends unknown[] = unknown[],
  TMessageIds extends string = string,
>(
  options: RuleTesterInitOptions &
    TestCasesOptions<
      TOptions extends [infer Option] ? TOptions | Option : TOptions,
      TMessageIds
    >,
) {
  return _run<
    TOptions extends [infer Option] ? TOptions | Option : TOptions,
    TMessageIds
  >({
    languageOptions: {
      parser: parserTypeScript,
    },
    ...options,
  })
}
