import { plugin } from '.'
import type { Linter } from 'eslint'
import type { Rules } from './dts'

export interface RecommendedOptions extends Linter.Config {
  /**
   * Overrides rules.
   *
   * @deprecated use `rules` instead
   */
  overridesRules?: Rules
}

export function createRecommendedConfig(options: RecommendedOptions = {}) {
  const { overridesRules = {}, ...configOptions } = options
  const config: Linter.Config = {
    ...configOptions,

    name: configOptions.name || 'ntnyq/recommended',
    files: configOptions.files || ['**/*.?([cm])[jt]s?(x)'],
    plugins: {
      ...(configOptions.plugins || {}),

      /* v8 ignore start */
      get ntnyq() {
        return plugin
      },
      /* v8 ignore stop */
    },
    rules: {
      ...configOptions.rules,

      // overrides rules
      ...overridesRules,
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
