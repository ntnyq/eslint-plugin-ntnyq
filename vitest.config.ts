import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['lcov', 'html', 'json', 'text'],
    },
  },
  plugins: [tsconfigPaths()],
})
