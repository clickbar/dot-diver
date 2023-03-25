import { expect, it } from 'vitest'

import { getByPath, setByPath } from '../src'

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
