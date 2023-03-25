import { it, assertType } from 'vitest'

import type { Path, PathValue } from '../src'

/* -------------------------------------------------------------------------- */
/*                               Primitive Tests                              */
/* -------------------------------------------------------------------------- */

it('Path type throws never for other types', () => {
  assertType<never>(null as unknown as Path<string>)
  assertType<never>(null as unknown as Path<number>)
  assertType<never>(null as unknown as Path<boolean>)
  assertType<never>(null as unknown as Path<bigint>)
  assertType<never>(null as unknown as Path<symbol>)
  assertType<never>(null as unknown as Path<undefined>)
  assertType<never>(null as unknown as Path<null>)
  assertType<never>(null as unknown as Path<unknown>)
  assertType<never>(null as unknown as Path<never>)
})

it('Path type returns primitive members on first level', () => {
  const test = {
    stringProp: 'a',
    numberProp: 1,
    booleanProp: true,
    bigintProp: 1n,
    symbolProp: Symbol(),
    undefinedProp: undefined,
    nullProp: null,
    unknownProp: null as unknown,
    neverProp: null as never,
  }

  type ExpectedType =
    | 'stringProp'
    | 'numberProp'
    | 'booleanProp'
    | 'bigintProp'
    | 'symbolProp'
    | 'undefinedProp'
    | 'nullProp'
    | 'unknownProp'
    | 'neverProp'

  assertType<ExpectedType>(null as unknown as Path<typeof test>)
})

/* -------------------------------------------------------------------------- */
/*                                Symbols Tests                               */
/* -------------------------------------------------------------------------- */

it('Symbols are not allowed members', () => {
  const test = {
    [Symbol()]: 'a',
  }

  assertType<never>(null as unknown as Path<typeof test>)
})

it('symbol index signature gets ignored', () => {
  type TestType = {
    [index: symbol]: string
  }

  assertType<never>(null as unknown as Path<TestType>)
})

/* -------------------------------------------------------------------------- */
/*                                 Array Tests                                */
/* -------------------------------------------------------------------------- */

it('Arrays can be accessed with number', () => {
  const test = ['a', 'b', 'c']

  assertType<number>(null as unknown as Path<typeof test>)

  const testObject = {
    array: test,
  }

  type ExpectedType = 'array' | `array.${number}`

  assertType<ExpectedType>(null as unknown as Path<typeof testObject>)

  // @ts-expect-error - string is not a number
  assertType<'array' | `array.${string}`>(null as unknown as Path<typeof testObject, string>)

  // @ts-expect-error - 0 is to narrow
  assertType<'array' | `array.0`>(null as unknown as Path<typeof testObject>)
})

it('nullable arrays can be accessed with number', () => {
    type TestType = {
        array: { a: string; b: number }[] | null
    }

    type ExpectedType = 'array' | `array.${number}` | `array.${number}.a` | `array.${number}.b`

    assertType<ExpectedType>(null as unknown as Path<TestType>)
})

/* -------------------------------------------------------------------------- */
/*                                Tuples Tests                                */
/* -------------------------------------------------------------------------- */

it('Tuples can be accessed with number', () => {
  type TestType = ['a', 'b', 'c']

  assertType<0 | 1 | 2>(null as unknown as Path<TestType>)

  type TestTypeObject = {
    tuple: TestType
  }

  type ExpectedType = 'tuple' | `tuple.${0 | 1 | 2}`

  assertType<ExpectedType>(null as unknown as Path<TestTypeObject>)

  // @ts-expect-error - string is not a number
  assertType<'tuple' | `tuple.${string}`>(null as unknown as Path<TestTypeObject, string>)
})

/* -------------------------------------------------------------------------- */
/*                              Optional Members                              */
/* -------------------------------------------------------------------------- */

it('Optional members are return with undefined', () => {
  type TestType = {
    optionalProp?: string
  }

  type ExpectedType = string | undefined

  assertType<ExpectedType>(null as unknown as PathValue<TestType, 'optionalProp'>)

  type TestTypeWithOptionalObject = {
    optionalProp?: {
      stringProp: string
    }
  }

  type ExpectedTypeWithOptionalObject =
    | {
        stringProp: string
      }
    | undefined

  assertType<ExpectedTypeWithOptionalObject>(
    null as unknown as PathValue<TestTypeWithOptionalObject, 'optionalProp'>
  )
  assertType<ExpectedType>(
    null as unknown as PathValue<TestTypeWithOptionalObject, 'optionalProp.stringProp'>
  )

  type TestTypeWithOptionalArray = {
    optionalProp?: string[]
  }

  type ExpectedTypeWithOptionalArray = string[] | undefined

  assertType<ExpectedTypeWithOptionalArray>(
    null as unknown as PathValue<TestTypeWithOptionalArray, 'optionalProp'>
  )
  assertType<string | undefined>(
    null as unknown as PathValue<TestTypeWithOptionalArray, 'optionalProp.0'>
  )
})

/* -------------------------------------------------------------------------- */
/*                             Readonly Properties                            */
/* -------------------------------------------------------------------------- */

it('Readonly values can be accessed', () => {
  type TestType = {
    readonly stringProp: string
  }

  type ExpectedType = 'stringProp'

  assertType<ExpectedType>(null as unknown as Path<TestType>)
})

it('Readonly arrays can be accessed', () => {
  type TestType = {
    readonly array: readonly string[]
  }

  type ExpectedType = 'array' | `array.${number}`

  assertType<ExpectedType>(null as unknown as Path<TestType>)
})

it('Readonly tuples can be accessed', () => {
  type TestType = {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  type ExpectedType = 'tuple' | `tuple.${0 | 1 | 2}`

  assertType<ExpectedType>(null as unknown as Path<TestType>)
})

it('Readonly objects can be accessed', () => {
  type TestType = {
    readonly object: {
      readonly stringProp: string
    }
  }

  type ExpectedType = 'object' | `object.stringProp`

  assertType<ExpectedType>(null as unknown as Path<TestType>)
})

it('Readonly objects with optional members can be accessed', () => {
  type TestType = {
    readonly object: {
      readonly stringProp?: string
    }
  }

  type ExpectedType = 'object' | `object.stringProp`

  assertType<ExpectedType>(null as unknown as Path<TestType>)
})

/* -------------------------------------------------------------------------- */
/*                              Index Signatures                              */
/* -------------------------------------------------------------------------- */

it('Type of index signature gets returned correctly', () => {
  type TestType = {
    [index: string | number]: string
  }

  assertType<string | number>(null as unknown as Path<TestType>)

  type TestType2 = {
    [index: string]: string
  }

  // @ts-expect-error - typescript transforms keyof string index signature to string | number
  assertType<string>(null as unknown as Path<TestType2>)

  type TestType3 = {
    [index: number]: string
  }

  assertType<number>(null as unknown as Path<TestType3>)
})

it('Symbols as index signature gets ignored', () => {
  type TestType = {
    [index: symbol]: string
  }

  assertType<never>(null as unknown as Path<TestType>)

  type TestType2 = {
    [index: string | symbol]: string
  }

  assertType<string | number>(null as unknown as Path<TestType2>)

  type TestType3 = {
    [index: number | symbol]: string
  }

  assertType<number>(null as unknown as Path<TestType3>)

  type TestType4 = {
    [index: string | number | symbol]: string
  }

  assertType<string | number>(null as unknown as Path<TestType4>)
})

it('Nested Path of nested objects in index signature gets returned correctly', () => {
  type TestTyp = {
    [index: string]: {
      [index: string]: {
        a: string
        b: number
      }
    }
  }

  type ExpectedType =
    | string
    | number
    | `${string}.${string}`
    | `${string}.${string}.a`
    | `${string}.${string}.b`

  assertType<ExpectedType>(null as unknown as Path<TestTyp>)

  // This works but the returning type of Path is far to broad and ignores the nested structure inside a index signature
  assertType<string | number>(null as unknown as Path<TestTyp>) // should throw an error
  // Typescript simplifies string | `${string}.${string}` to string
  // We can't really do anything about this without sacrificing readability of code completion
})

/* -------------------------------------------------------------------------- */
/*                                  PathValue                                 */
/* -------------------------------------------------------------------------- */

it('PathValue returns the correct type', () => {
  const test = {
    stringProp: 'a',
    numberProp: 1,
    booleanProp: true,
    bigintProp: 1n,
    symbolProp: Symbol(),
    undefinedProp: undefined,
    nullProp: null,
    unknownProp: null as unknown,
    neverProp: null as never,
  }

  assertType<string>(null as unknown as PathValue<typeof test, 'stringProp'>)
  assertType<number>(null as unknown as PathValue<typeof test, 'numberProp'>)
  assertType<boolean>(null as unknown as PathValue<typeof test, 'booleanProp'>)
  assertType<bigint>(null as unknown as PathValue<typeof test, 'bigintProp'>)
  assertType<symbol>(null as unknown as PathValue<typeof test, 'symbolProp'>)
  assertType<undefined>(null as unknown as PathValue<typeof test, 'undefinedProp'>)
  assertType<null>(null as unknown as PathValue<typeof test, 'nullProp'>)
  assertType<unknown>(null as unknown as PathValue<typeof test, 'unknownProp'>)
  assertType<never>(null as unknown as PathValue<typeof test, 'neverProp'>)
})

it('PathValue works with optional (nested) members', () => {
  type TestType = {
    optionalProp?: {
      stringProp: string
    }
  }

  assertType<string | undefined>(null as unknown as PathValue<TestType, 'optionalProp.stringProp'>)
})

it('PathValue works with readonly (nested) members', () => {
  type TestType = {
    readonly stringProp: string
  }

  assertType<string>(null as unknown as PathValue<TestType, 'stringProp'>)

  type TestTypeArray = {
    readonly array: readonly string[]
  }

  assertType<readonly string[]>(null as unknown as PathValue<TestTypeArray, 'array'>)
  assertType<string | undefined>(null as unknown as PathValue<TestTypeArray, 'array.0'>)

  type TestTypeTuple = {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  assertType<readonly ['a', 'b', 'c']>(null as unknown as PathValue<TestTypeTuple, 'tuple'>)
  assertType<'a'>(null as unknown as PathValue<TestTypeTuple, 'tuple.0'>)

  type TestTypeObject = {
    readonly object: {
      readonly stringProp: string
    }
  }

  assertType<{ readonly stringProp: string }>(
    null as unknown as PathValue<TestTypeObject, 'object'>
  )
  assertType<string>(null as unknown as PathValue<TestTypeObject, 'object.stringProp'>)
})

it('PathValue works with index signatures', () => {
  type TestType = {
    [index: string]: string
  }

  assertType<string | undefined>(null as unknown as PathValue<TestType, string>)
  assertType<string | undefined>(null as unknown as PathValue<TestType, number>)
})

it('PathValue works with nested index signatures', () => {
  type TestType = {
    [index: string]: {
      [index: string]: {
        a: string
        b: number
      }
    }
  }

  assertType<string | undefined>(null as unknown as PathValue<TestType, `${string}.${string}.a`>)
  assertType<number | undefined>(null as unknown as PathValue<TestType, `${string}.${string}.b`>)
})

it('PathValue works with arrays', () => {
  type TestType = {
    array: string[]
  }

  assertType<string[]>(null as unknown as PathValue<TestType, 'array'>)
  assertType<string | undefined>(null as unknown as PathValue<TestType, 'array.0'>)
})

it('PathValue works with objects in arrays', () => {
  type TestType = {
    array: { a: string }[]
  }

  assertType<{ a: string }[]>(null as unknown as PathValue<TestType, 'array'>)
  assertType<string | undefined>(null as unknown as PathValue<TestType, 'array.0.a'>)
})


it('PathValue works with objects in nullable arrays', () => {
    type TestType = {
        array: { a: string; b: number }[] | null
    }
    assertType<{ a: string; b: number } | undefined>(null as unknown as PathValue<TestType, 'array.4'>)
    assertType<string | undefined>(null as unknown as PathValue<TestType, 'array.4.a'>)
})

it('PathValue works with unions', () => {
  type TestType = {
    union: string | number
  }

  assertType<string | number>(null as unknown as PathValue<TestType, 'union'>)

  type TestType2 = {
    union: string | { a: string }
  }

  assertType<string | { a: string }>(null as unknown as PathValue<TestType2, 'union'>)
  assertType<string>(null as unknown as PathValue<TestType2, 'union.a'>)
})

it('PathValue works with tuples', () => {
  type TestType = {
    tuple: ['a', 'b', 'c']
  }

  assertType<['a', 'b', 'c']>(null as unknown as PathValue<TestType, 'tuple'>)
  assertType<'a'>(null as unknown as PathValue<TestType, 'tuple.0'>)
})

it('PathValue works with objects in tuples', () => {
  type TestType = {
    tuple: [{ a: string }, 'b']
  }

  assertType<{ a: string }>(null as unknown as PathValue<TestType, 'tuple.0'>)
  assertType<string>(null as unknown as PathValue<TestType, 'tuple.0.a'>)
})
