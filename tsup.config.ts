import process from 'node:process'
import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'node16.14',
  dts: true,
  clean: true,
  watch: !!process.env.DEV,
  define: {
    __PKG_NAME__: JSON.stringify(pkg.name),
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
})
