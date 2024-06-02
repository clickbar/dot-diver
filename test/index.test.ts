import { expect, it } from 'vitest'

import { getByPath, setByPath } from '../src'

import type { Path, PathValue, SetPathValue, SearchableObject } from '../src'

it('can get simple member', () => {
  const test = {
    first: 'test',
    second: ['secondTest'],
    third: {
      id: 2,
      date: [],
    },
  }

  expect(getByPath(test, 'first')).toBe('test')
  expect(getByPath(test, 'second.0')).toBe('secondTest')
  expect(getByPath(test, 'third.date')).toStrictEqual([])
})

it('can set simple member', () => {
  const test = {
    first: 'test',
    second: ['secondTest'],
    third: {
      id: 2,
      date: ['thirdTest'],
    },
  }

  setByPath(test, 'first', 'testChanged')
  setByPath(test, 'second.0', 'testChanged2')
  setByPath(test, 'third.date', [])

  expect(test.first).toBe('testChanged')
  expect(test.second[0]).toBe('testChanged2')
  expect(test.third.date).toStrictEqual([])
})

/* -------------------------------------------------------------------------- */
/*                                Readme Tests                                */
/* -------------------------------------------------------------------------- */

it('Test readme introduction', () => {
  const object = {
    a: 'Hello world',
  }

  const result = getByPath(object, 'a') // result is 'Hello world'

  expect(result).toBe('Hello world')
})

it('Test readme usage example: 🔎 getByPath and 🔏 setByPath', () => {
  // Define a sample object with nested properties
  const object = {
    a: 'hello',
    b: {
      c: 42,
      d: {
        e: 'world',
      },
    },
    f: [{ g: 'array-item-1' }, { g: 'array-item-2' }],
  }

  // Example 1: Get a value by path
  const value1 = getByPath(object, 'a') // Output: 'hello'
  expect(value1).toBe('hello')

  const value2 = getByPath(object, 'b.c') // Output: 42
  expect(value2).toBe(42)

  const value3 = getByPath(object, 'b.d.e') // Output: 'world'
  expect(value3).toBe('world')

  const value4 = getByPath(object, 'f.0') // Output: { g: 'array-item-1' }
  expect(value4).toStrictEqual({ g: 'array-item-1' })

  const value5 = getByPath(object, 'f.1.g') // Output: 'array-item-2'
  expect(value5).toBe('array-item-2')

  // Example 2: Set a value by path
  setByPath(object, 'a', 'new hello')
  expect(object.a).toBe('new hello')

  setByPath(object, 'b.c', 100)
  expect(object.b.c).toBe(100)

  setByPath(object, 'b.d.e', 'new world')
  expect(object.b.d.e).toBe('new world')

  setByPath(object, 'f.0', { g: 'new array-item-1' })
  expect(object.f[0]).toStrictEqual({ g: 'new array-item-1' })

  setByPath(object, 'f.1.g', 'new array-item-2')
  expect(object.f[1].g).toBe('new array-item-2')
})

it('returns undefined on non objects', () => {
  const test: any = {
    first: 'test',
    null: null,
    undef: undefined,
  }

  expect(getByPath(test, 'first.foo')).toBe(undefined)
  expect(getByPath(test, 'null.bar')).toBe(undefined)
  expect(getByPath(test, 'undef.baz')).toBe(undefined)
})

it('throws when setting invalid path', () => {
  const test: any = {
    first: 'test',
    null: null,
    undef: undefined,
    symbol: Symbol(),
  }

  expect(() => {
    setByPath(null as any, 'first', true)
  }).toThrowError("Cannot create property 'first' on null")
  expect(() => {
    setByPath(test, 'first.foo', true)
  }).toThrowError("Cannot create property 'foo' on string")
  expect(() => {
    setByPath(test, 'first.foo.baz', true)
  }).toThrowError("Cannot create property 'foo' on string")
  expect(() => {
    setByPath(test, 'null.bar', true)
  }).toThrowError("Cannot create property 'bar' on null")
  expect(() => {
    setByPath(test, 'undef.baz', true)
  }).toThrowError("Cannot create property 'baz' on undefined")
  expect(() => {
    setByPath(test, 'symbol.baz', true)
  }).toThrowError("Cannot create property 'baz' on symbol")
})

it('Test readme usage example: ⚙️ Customizing the Depth Limit', () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function getByPathDepth5<T extends SearchableObject, P extends Path<T, P, { depth: 5 }> & string>(
    object: T,
    path: P,
  ): PathValue<T, P> {
    return getByPath(object, path) as PathValue<T, P>
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function setByPathDepth5<
    T extends SearchableObject,
    P extends Path<T, P, { onlyWriteable: true, depth: 5 }> & string,
    V extends SetPathValue<T, P>,
  >(object: T, path: P, value: V): void {
    setByPath(object, path, value as SetPathValue<T, P>)
  }

  // previous readme test still works
  const object = {
    a: 'hello',
    b: {
      c: 42,
      d: {
        e: 'world',
      },
    },
    f: [{ g: 'array-item-1' }, { g: 'array-item-2' }],
  }

  // Example 1: Get a value by path
  const value1 = getByPathDepth5(object, 'a') // Output: 'hello'
  expect(value1).toBe('hello')

  const value2 = getByPathDepth5(object, 'b.c') // Output: 42
  expect(value2).toBe(42)

  const value3 = getByPathDepth5(object, 'b.d.e') // Output: 'world'
  expect(value3).toBe('world')

  const value4 = getByPathDepth5(object, 'f.0') // Output: { g: 'array-item-1' }
  expect(value4).toStrictEqual({ g: 'array-item-1' })

  const value5 = getByPathDepth5(object, 'f.1.g') // Output: 'array-item-2'
  expect(value5).toBe('array-item-2')

  // Example 2: Set a value by path
  setByPathDepth5(object, 'a', 'new hello')
  expect(object.a).toBe('new hello')

  setByPathDepth5(object, 'b.c', 100)
  expect(object.b.c).toBe(100)

  setByPathDepth5(object, 'b.d.e', 'new world')
  expect(object.b.d.e).toBe('new world')

  setByPathDepth5(object, 'f.0', { g: 'new array-item-1' })
  expect(object.f[0]).toStrictEqual({ g: 'new array-item-1' })

  setByPathDepth5(object, 'f.1.g', 'new array-item-2')
  expect(object.f[1].g).toBe('new array-item-2')
})

it('setByPath and getByPath accepts arrays', () => {
  const object = [{ test: '' }]
  setByPath(object, '0.test', 'ok')
  expect(getByPath(object, '0.test')).toBe('ok')
})

it('Test for prototype pollution', () => {
  const object = {}

  expect(() => {
    // @ts-expect-error - this is not a valid path for the object
    setByPath(object, '__proto__.polluted', true)
  }).toThrowError('__proto__')

  // @ts-expect-error - this is not a valid path for the object
  expect(getByPath(object, '__proto__')).toBe(undefined)

  expect(() => {
    // @ts-expect-error - this is not a valid path for the object
    setByPath(object, 'constructor.polluted', true)
  }).toThrowError('constructor')

  // @ts-expect-error - this is not a valid path for the object
  expect(getByPath(object, 'constructor')).toBe(undefined)

  // @ts-expect-error - this is should not be defined on the object
  expect(object.polluted).toBe(undefined)

  const object2 = { constructor: { prototype: { polluted: true } } }

  expect(getByPath(object2, 'constructor.prototype.polluted')).toBe(true)

  setByPath(object2, 'constructor.prototype.polluted', false)

  expect(object2.constructor.prototype.polluted).toBe(false)

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  const testClass = class TestClass {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}
  }

  const object3 = new testClass()

  // @ts-expect-error - this is not a valid path for the object
  expect(getByPath(object3, 'constructor.prototype')).toBe(undefined)

  // @ts-expect-error - this is not a valid path for the object
  expect(getByPath(object3, 'constructor')).toBe(undefined)

  expect(() => {
    // @ts-expect-error - this is not a valid path for the object
    setByPath(object3, 'constructor.polluted', true)
  }).toThrowError('constructor')

  expect(() => {
    // @ts-expect-error - this is not a valid path for the object
    setByPath(object3, '__proto__.polluted', true)
  }).toThrowError('__proto__')
})

/**
 * We handle an empty path by returning the object itself instead of a property of the object.
 * This diverges from the default behavior, but is probably more intuitive and useful in most cases.
 * @see https://github.com/clickbar/dot-diver/issues/30
 */
it('Returns the object itself, if the given path is empty', () => {
  const object = { test: 'ok' }

  expect(getByPath(object, '')).toBe(object)
})
