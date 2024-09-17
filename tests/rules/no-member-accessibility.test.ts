import rule, { messageId, RULE_NAME } from '../../src/rules/no-member-accessibility'
import { $, run } from '../internal'

const validCases = [
  $`
    class Test {
      x: number
      constructor(x: number) {
        this.x = x
      }
      get internalValue() {
        return this.x
      }
      set internalValue(value: number) {
        this.x = value
      }
      square(): number {
        return this.x * this.x
      }
      half(): number {
        return this.x / 2
      }
    }
  `,
]
const invalidCases = [
  [
    $`
      class Test {
        public static internalValue() {
          return this.x
        }
      }
    `,
    $`
      class Test {
        static internalValue() {
          return this.x
        }
      }
    `,
  ],
  [
    $`
      class Test {
        private x: number
      }
    `,
    $`
      class Test {
        x: number
      }
    `,
  ],
  [
    $`
      class Test {
        public get internalValue() {
          return this.x
        }
      }
    `,
    $`
      class Test {
        get internalValue() {
          return this.x
        }
      }
    `,
  ],
  [
    $`
      class Test {
        public set internalValue(value: number) {
          this.x = value
        }
      }
    `,
    $`
      class Test {
        set internalValue(value: number) {
          this.x = value
        }
      }
    `,
  ],
  [
    $`
      class Test {
        public square(): number {
          return this.x * this.x
        }
      }
    `,
    $`
      class Test {
        square(): number {
          return this.x * this.x
        }
      }
    `,
  ],
  [
    $`
      class Test {
        protected half(): number {
          return this.x / 2
        }
      }
    `,
    $`
      class Test {
        half(): number {
          return this.x / 2
        }
      }
    `,
  ],
  [
    $`
      class Test {
        public constructor(x: number) {
          this.x = x
        }
      }
    `,
    $`
      class Test {
        constructor(x: number) {
          this.x = x
        }
      }
    `,
  ],
]

run({
  name: RULE_NAME,
  rule,
  valid: validCases,
  invalid: invalidCases.map(i => ({
    code: i[0],
    output: i[1],
    errors: [{ messageId }],
  })),
})
