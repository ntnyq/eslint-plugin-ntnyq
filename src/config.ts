import { plugin } from '.'
import type { Linter } from 'eslint'
import type { Rules } from './dts'

export interface RecommendedOptions
  extends Pick<Linter.Config, 'name' | 'files' | 'ignores' | 'languageOptions'> {
  /**
   * Overrides rules.
   */
  overridesRules?: Rules
}

export function createRecommendedConfig(options: RecommendedOptions = {}) {
  const config: Linter.Config = {
    name: options.name || 'ntnyq/recommended',
    files: options.files || ['**/*.ts'],
    languageOptions: {
      ...(options.languageOptions || {}),
    },
    plugins: {
      get ntnyq() {
        return plugin
      },
    },
    rules: {
      ...(options.overridesRules || {}),
    },
  }
  return config
}

export const recommended = [
  // flat recommended config
  createRecommendedConfig(),
]

export const configs = {
  recommended,
}
