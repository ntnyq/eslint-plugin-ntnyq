import { plugin } from '.'
import type { Linter } from 'eslint'
import type { Rules } from './dts'

export interface RecommendedOptions extends Linter.Config {
  /**
   * Overrides rules.
   */
  overridesRules?: Rules
}

export function createRecommendedConfig(options: RecommendedOptions = {}) {
  const config: Linter.Config = {
    ...options,

    name: options.name || 'ntnyq/recommended',
    files: options.files || ['**/*.ts'],
    plugins: {
      ...(options.plugins || {}),

      /* v8 ignore start */
      get ntnyq() {
        return plugin
      },
      /* v8 ignore stop */
    },
    rules: {
      ...options.rules,

      // overrides rules
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
