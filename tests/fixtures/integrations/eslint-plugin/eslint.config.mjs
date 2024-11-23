import tseslint from 'typescript-eslint'
import { createRecommendedConfig } from 'eslint-plugin-ntnyq'

export default tseslint.config(
  // typescript-eslint recommended rules
  ...tseslint.configs.recommended,

  // Plugin rules
  createRecommendedConfig({
    overridesRules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  }),
)
