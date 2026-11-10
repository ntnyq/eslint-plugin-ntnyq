import { describe, expect, it } from 'vitest'
import { deepMerge, isObjectNotArray } from '../../src/utils/merge'

describe('deepMerge', () => {
  it('preserves special keys as own properties without changing prototypes', () => {
    const first = {
      ['__proto__']: { first: true },
      constructor: { first: true },
    }
    const second = {
      ['__proto__']: { second: true },
      constructor: { second: true },
    }
    const result = deepMerge(first, second)

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
    expect(Object.hasOwn(result, '__proto__')).toBe(true)
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toEqual(
      { first: true, second: true },
    )
    expect(result.constructor).toEqual({ first: true, second: true })
    expect(deepMerge({}, second).constructor).toEqual({ second: true })
  })

  it('does not merge inherited values into own properties', () => {
    const first = {}
    Object.setPrototypeOf(first, { setting: { inherited: true } })
    expect(deepMerge(first, { setting: { own: true } })).toEqual({
      setting: { own: true },
    })
  })
  const OBJECT_DEEP = {
    a: 1,
    b: {
      c: 2,
      d: 3,
    },
  }
  const OBJECT_SHALLOW = {
    f: 5,
    b: {
      c: 3,
      e: 4,
    },
  }
  const OBJECT_ARRAY = {
    b: [3, 4, 5],
    c: 2,
  }
  it('should merge two objects', () => {
    expect(deepMerge(OBJECT_DEEP, OBJECT_SHALLOW)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": {
          "c": 3,
          "d": 3,
          "e": 4,
        },
        "f": 5,
      }
    `)
  })

  it('should merge object with array', () => {
    expect(deepMerge(OBJECT_DEEP, OBJECT_ARRAY)).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": [
          3,
          4,
          5,
        ],
        "c": 2,
      }
    `)
  })

  it('should merge with first empty', () => {
    expect(deepMerge({}, OBJECT_SHALLOW)).toMatchInlineSnapshot(`
      {
        "b": {
          "c": 3,
          "e": 4,
        },
        "f": 5,
      }
    `)
  })

  it('should merge with second empty', () => {
    expect(deepMerge(OBJECT_DEEP, {})).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": {
          "c": 2,
          "d": 3,
        },
      }
    `)
  })
})

describe('isObjectNotArray', () => {
  it('should return true for an object', () => {
    expect(isObjectNotArray({})).toBeTruthy()
  })
  it('should return false for an array', () => {
    expect(isObjectNotArray([])).toBeFalsy()
  })
})
