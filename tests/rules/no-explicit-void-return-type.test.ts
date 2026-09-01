import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/no-explicit-void-return-type'
import { $, run } from '../internal'
import type { Options } from '../../src/rules/no-explicit-void-return-type'

await run<Options>({
  name: RULE_NAME,
  rule,
  valid: [
    {
      code: $`
        function cleanup() {}
        const dispose = () => {}
        const load = async () => {}
        function getValue(): undefined {
          return undefined
        }
        const loadValue = async (): Promise<undefined> => undefined
      `,
    },
    {
      code: $`
        type Callback = () => void
        type AsyncCallback = () => Promise<void>
        interface Service {
          cleanup(): void
          load(): Promise<void>
        }
        declare function cleanup(): void
        declare function load(): Promise<void>
        abstract class BaseService {
          abstract cleanup(): void
          abstract load(): Promise<void>
        }
      `,
    },
    {
      code: $`
        const load = async (): PromiseLike<void> => Promise.resolve()
        const loadMaybe = async (): Promise<void | undefined> => undefined
        const loadGlobal = async (): globalThis.Promise<void> => undefined
      `,
    },
  ],
  invalid: [
    {
      code: $`
        function cleanup(): void {
          cleanupResource()
        }
        const dispose = function (): void {
          cleanupResource()
        }
        const reset = (): void => {
          if (shouldSkipReset) {
            return
          }
          cleanupResource()
        }
        class Service {
          cleanup(): void {
            cleanupResource()
          }
          async load(): Promise<void> {
            await loadResource()
          }
        }
        const service = {
          cleanup(): void {
            cleanupResource()
          },
          async load(): Promise<void> {
            await loadResource()
          },
        }
        const outer = (): void => {
          const nested = () => {
            return 1
          }
          nested()
        }
      `,
      errors: Array.from({ length: 8 }, () => 'noExplicitVoidReturnType'),
      output: $`
        function cleanup() {
          cleanupResource()
        }
        const dispose = function () {
          cleanupResource()
        }
        const reset = () => {
          if (shouldSkipReset) {
            return
          }
          cleanupResource()
        }
        class Service {
          cleanup() {
            cleanupResource()
          }
          async load() {
            await loadResource()
          }
        }
        const service = {
          cleanup() {
            cleanupResource()
          },
          async load() {
            await loadResource()
          },
        }
        const outer = () => {
          const nested = () => {
            return 1
          }
          nested()
        }
      `,
    },
    {
      code: $`
        const expression = (): void => console.log('done')
        const returnsUndefined = (): void => {
          return undefined
        }
        const throws = (): void => {
          throw new Error('failed')
        }
        const loops = (): void => {
          while (true) {}
        }
        const recursive = (): void => recursive()
        const promiseFactory = (): Promise<void> =>
          new Promise(resolve => resolve())
        const asyncReturnsUndefined = async (): Promise<void> => {
          return undefined
        }
        const asyncThrows = async (): Promise<void> => {
          throw new Error('failed')
        }
        const invalidAsync = async (): void => {}
      `,
      errors(errors) {
        expect(errors).toHaveLength(9)
        expect(errors.every(error => error.suggestions?.length === 1)).toBe(
          true,
        )
        expect(errors[0]?.suggestions?.[0]?.desc).toBe(
          'Remove the explicit `void` return type; TypeScript may infer a different type.',
        )
        expect(errors[5]?.suggestions?.[0]?.desc).toBe(
          'Remove the explicit `Promise<void>` return type; TypeScript may infer a different type.',
        )
      },
      output: null,
    },
    {
      code: $`
        const sync = (): /* keep sync contract */ void => {}
        const asyncTask = async (): Promise<
          /* keep async contract */ void
        > => {}
      `,
      errors(errors) {
        expect(errors).toHaveLength(2)
        expect(errors.every(error => error.fix == null)).toBe(true)
        expect(errors.every(error => error.suggestions == null)).toBe(true)
      },
      output: null,
    },
    {
      code: $`
        const outer = (): void => {
          const inner = () => {
            return undefined
          }
          inner()
        }
      `,
      errors: ['noExplicitVoidReturnType'],
      output: $`
        const outer = () => {
          const inner = () => {
            return undefined
          }
          inner()
        }
      `,
    },
  ],
})
