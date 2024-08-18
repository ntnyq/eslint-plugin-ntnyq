import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import tsParser from '@typescript-eslint/parser'
import { run as _run } from 'eslint-vitest-rule-tester'
import type { RuleTesterInitOptions, TestCasesOptions } from 'eslint-vitest-rule-tester'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const resolve = (...args: string[]) => path.resolve(__dirname, '..', ...args)

export { unindent as $ } from 'eslint-vitest-rule-tester'

export function run(options: TestCasesOptions & RuleTesterInitOptions) {
  return _run({
    languageOptions: {
      parser: tsParser,
    },
    ...options,
  })
}
