import tseslint from 'typescript-eslint'
import pluginNtnyq from 'eslint-plugin-ntnyq'

export default tseslint.config(
  // typescript-eslint recommended rules
  ...tseslint.configs.recommended,

  // Plugin rules
  {
    files: ['*.ts'],
    plugins: {
      ntnyq: pluginNtnyq,
    },
    rules: {
      ...pluginNtnyq.configs.all.rules,
    },
  },
)
