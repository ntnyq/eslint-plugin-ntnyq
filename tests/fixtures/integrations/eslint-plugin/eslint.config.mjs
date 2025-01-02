import tseslint from 'typescript-eslint'
import { createConfig } from 'eslint-plugin-ntnyq'

export default tseslint.config(
  // typescript-eslint recommended rules
  ...tseslint.configs.recommended,

  // Plugin rules
  createConfig({
    rules: {
      'ntnyq/no-member-accessibility': 'error',
    },
  }),
)
