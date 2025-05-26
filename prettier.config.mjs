// @ts-check

import { defineConfig } from '@ntnyq/prettier-config'

export default defineConfig({
  overrides: [
    {
      files: ['**/*.css'],
      options: {
        singleQuote: false,
      },
    },
  ],
})
