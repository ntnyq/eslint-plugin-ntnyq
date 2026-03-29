import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  deps: {},
  dts: true,
  entry: ['src/index.ts'],
  platform: 'node',
})
