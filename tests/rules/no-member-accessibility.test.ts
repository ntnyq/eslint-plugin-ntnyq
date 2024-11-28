import { expect } from 'vitest'
import rule, { RULE_NAME } from '../../src/rules/no-member-accessibility'
import { $, run } from '../internal'

run({
  name: RULE_NAME,
  rule,
  valid: [
    {
      filename: 'accessibility.ts',
      code: $`
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
    },
  ],
  invalid: [
    {
      filename: 'public.ts',
      code: $`
        class Test {
          public static internalValue() {
            return this.x
          }
        }
      `,
      output: $`
        class Test {
          static internalValue() {
            return this.x
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 9,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  22,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'private.ts',
      code: $`
        class Test {
          private x: number
        }
      `,
      output: $`
        class Test {
          x: number
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 10,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  23,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "PropertyDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'getter.ts',
      code: $`
        class Test {
          public get internalValue() {
            return this.x
          }
        }
      `,
      output: $`
        class Test {
          get internalValue() {
            return this.x
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 9,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  22,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'setter.ts',
      code: $`
        class Test {
          public set internalValue(value: number) {
            this.x = value
          }
        }
      `,
      output: $`
        class Test {
          set internalValue(value: number) {
            this.x = value
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 9,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  22,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'public-method.ts',
      code: $`
        class Test {
          public square(): number {
            return this.x * this.x
          }
        }
      `,
      output: $`
        class Test {
          square(): number {
            return this.x * this.x
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 9,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  22,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'protected-method.ts',
      code: $`
        class Test {
          protected half(): number {
            return this.x / 2
          }
        }
      `,
      output: $`
        class Test {
          half(): number {
            return this.x / 2
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 12,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  25,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
    {
      filename: 'constructor.ts',
      code: $`
        class Test {
          public constructor(x: number) {
            this.x = x
          }
        }
      `,
      output: $`
        class Test {
          constructor(x: number) {
            this.x = x
          }
        }
      `,
      errors(errors) {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 9,
              "endLine": 2,
              "fix": {
                "range": [
                  15,
                  22,
                ],
                "text": "",
              },
              "line": 2,
              "message": "Disallow usage of typescript member accessibility",
              "messageId": "noMemberAccessibility",
              "nodeType": "MethodDefinition",
              "ruleId": "no-member-accessibility",
              "severity": 2,
            },
          ]
        `)
      },
    },
  ],
})
