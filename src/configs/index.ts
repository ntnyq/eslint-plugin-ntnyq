import parseTypeScript from '@typescript-eslint/parser'
import { plugin } from '..'
import type { Linter } from 'eslint'
import type { RulesWithPluginName } from '../dts'

export type CreateConfigOptions<T extends string = 'ntnyq'> = Omit<
  Linter.Config,
  'rules'
> & {
  rules?: Partial<RulesWithPluginName<T>>
}

export function createConfig<T extends string = 'ntnyq'>(
  options: CreateConfigOptions<T> = {},
) {
  const config: Linter.Config = {
    ...options,
    files: options.files || ['**/*.?([cm])[jt]s?(x)'],
    plugins: {
      ...(options.plugins || {}),

      /* v8 ignore start */
      get ntnyq() {
        return plugin
      },
      /* v8 ignore stop */
    },
    languageOptions: {
      ...options.languageOptions,
      parser: parseTypeScript,
    },
  }
  return config
}

/**
 * recommended config preset
 */
export const recommended = [
  createConfig({
    name: 'ntnyq/recommended',
    rules: {
      'ntnyq/prefer-newline-after-file-header': 'error',
    },
  }),
]

export const configs = {
  recommended,
}
