import tseslint from 'typescript-eslint'
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default tseslint.config(
  // typescript-eslint recommended rules
  ...tseslint.configs.recommended,

  // Plugin rules
  ...pluginNtnyq.configs.all,
)
