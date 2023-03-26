import { expect, it } from 'vitest'

import { getByPath, setByPath } from '../src'

import type { Path, SearchableObject, PathValue } from '../src'

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

it('Test readme usage example: ⚙️ Customizing the Depth Limit', () => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function getByPathDepth10<T extends SearchableObject, P extends Path<T, 5> & string>(
    object: T,
    path: P
  ): PathValue<T, P, 5> {
    return getByPath(object, path) as PathValue<T, P, 5>
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function setByPathDepth10<
    T extends SearchableObject,
    P extends Path<T, 5> & string,
    V extends PathValue<T, P, 5>
  >(object: T, path: P, value: V): void {
    setByPath(object, path, value as PathValue<T, P, 10>)
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
  const value1 = getByPathDepth10(object, 'a') // Output: 'hello'
  expect(value1).toBe('hello')

  const value2 = getByPathDepth10(object, 'b.c') // Output: 42
  expect(value2).toBe(42)

  const value3 = getByPathDepth10(object, 'b.d.e') // Output: 'world'
  expect(value3).toBe('world')

  const value4 = getByPathDepth10(object, 'f.0') // Output: { g: 'array-item-1' }
  expect(value4).toStrictEqual({ g: 'array-item-1' })

  const value5 = getByPathDepth10(object, 'f.1.g') // Output: 'array-item-2'
  expect(value5).toBe('array-item-2')

  // Example 2: Set a value by path
  setByPathDepth10(object, 'a', 'new hello')
  expect(object.a).toBe('new hello')

  setByPathDepth10(object, 'b.c', 100)
  expect(object.b.c).toBe(100)

  setByPathDepth10(object, 'b.d.e', 'new world')
  expect(object.b.d.e).toBe('new world')

  setByPathDepth10(object, 'f.0', { g: 'new array-item-1' })
  expect(object.f[0]).toStrictEqual({ g: 'new array-item-1' })

  setByPathDepth10(object, 'f.1.g', 'new array-item-2')
  expect(object.f[1].g).toBe('new array-item-2')
})
