import { it, expectTypeOf } from 'vitest'

import type { Path, PathValue } from '../src'

/* -------------------------------------------------------------------------- */
/*                               Primitive Tests                              */
/* -------------------------------------------------------------------------- */

it('Path type throws never for other types', () => {
  expectTypeOf<Path<string>>().toEqualTypeOf<never>()
  expectTypeOf<Path<number>>().toEqualTypeOf<never>()
  expectTypeOf<Path<boolean>>().toEqualTypeOf<never>()
  expectTypeOf<Path<bigint>>().toEqualTypeOf<never>()
  expectTypeOf<Path<symbol>>().toEqualTypeOf<never>()
  expectTypeOf<Path<undefined>>().toEqualTypeOf<never>()
  expectTypeOf<Path<null>>().toEqualTypeOf<never>()
  expectTypeOf<Path<unknown>>().toEqualTypeOf<never>()
  expectTypeOf<Path<never>>().toEqualTypeOf<never>()
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

  expectTypeOf<Path<typeof test>>().toEqualTypeOf<ExpectedType>()
})

/* -------------------------------------------------------------------------- */
/*                                Symbols Tests                               */
/* -------------------------------------------------------------------------- */

it('Symbols are not allowed members', () => {
  const test = {
    [Symbol()]: 'a',
  }

  expectTypeOf<Path<typeof test>>().toEqualTypeOf<never>()
})

it('symbol index signature gets ignored', () => {
  type TestType = {
    [index: symbol]: string
  }

  expectTypeOf<Path<TestType>>().toEqualTypeOf<never>()
})

/* -------------------------------------------------------------------------- */
/*                                 Array Tests                                */
/* -------------------------------------------------------------------------- */

it('Arrays can be accessed with number', () => {
  const test: string[] = ['a', 'b', 'c']

  expectTypeOf<Path<typeof test>>().toEqualTypeOf<number>()

  const testObject = {
    array: test,
  }

  type ExpectedType = 'array' | `array.${number}`

  expectTypeOf<Path<typeof testObject>>().toEqualTypeOf<ExpectedType>()

  // @ts-expect-error - string is not a number
  expectTypeOf<Path<typeof testObject>>().toEqualTypeOf<'array' | `array.${string}`>()

  // @ts-expect-error - 0 is to narrow
  expectTypeOf<Path<typeof testObject>>().toEqualTypeOf<'array' | `array.0`>()
})

it('nullable arrays can be accessed with number', () => {
  type TestType = {
    array: { a: string; b: number }[] | null
  }

  type ExpectedType = 'array' | `array.${number}` | `array.${number}.a` | `array.${number}.b`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

/* -------------------------------------------------------------------------- */
/*                                Tuples Tests                                */
/* -------------------------------------------------------------------------- */

it('Tuples can be accessed with number', () => {
  type TestType = ['a', 'b', 'c']

  expectTypeOf<Path<TestType>>().toEqualTypeOf<0 | 1 | 2>()

  type TestTypeObject = {
    tuple: TestType
  }

  type ExpectedType = 'tuple' | `tuple.${0 | 1 | 2}`

  expectTypeOf<Path<TestTypeObject>>().toEqualTypeOf<ExpectedType>()

  // @ts-expect-error - string is not a number
  expectTypeOf<Path<TestType>>().toEqualTypeOf<'tuple' | `tuple.${string}`>()
})

it('Tuples/Arrays with specific length can be accessed with number', () => {
  type TestType = [string] // length 1

  expectTypeOf<Path<TestType>>().toEqualTypeOf<0>()

  type EmptyTestType = [] // length 0

  expectTypeOf<Path<EmptyTestType>>().toEqualTypeOf<never>()

  type NotEmptyArray = string[]

  expectTypeOf<Path<NotEmptyArray>>().toEqualTypeOf<number>()
})

/* -------------------------------------------------------------------------- */
/*                              Optional Members                              */
/* -------------------------------------------------------------------------- */

it('Paths of optional members gets returned', () => {
  type TestType = {
    optionalProp?: string
  }

  expectTypeOf<Path<TestType>>().toEqualTypeOf<'optionalProp'>()

  type TestTypeWithOptionalObject = {
    optionalProp?: {
      stringProp: string
    }
  }

  expectTypeOf<Path<TestTypeWithOptionalObject>>().toEqualTypeOf<
    'optionalProp' | `optionalProp.stringProp`
  >()

  type ExpectedTypeWithOptionalObject =
    | {
        stringProp: string
      }
    | undefined

  expectTypeOf<Path<ExpectedTypeWithOptionalObject>>().toEqualTypeOf<'stringProp'>()

  type TestTypeWithOptionalArray = {
    optionalProp?: string[]
  }

  expectTypeOf<Path<TestTypeWithOptionalArray>>().toEqualTypeOf<
    'optionalProp' | `optionalProp.${number}`
  >()
})

/* -------------------------------------------------------------------------- */
/*                             Readonly Properties                            */
/* -------------------------------------------------------------------------- */

it('Readonly values can be accessed', () => {
  type TestType = {
    readonly stringProp: string
  }

  type ExpectedType = 'stringProp'

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly arrays can be accessed', () => {
  type TestType = {
    readonly array: readonly string[]
  }

  type ExpectedType = 'array' | `array.${number}`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly tuples can be accessed', () => {
  type TestType = {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  type ExpectedType = 'tuple' | `tuple.${0 | 1 | 2}`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly objects can be accessed', () => {
  type TestType = {
    readonly object: {
      readonly stringProp: string
    }
  }

  type ExpectedType = 'object' | `object.stringProp`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly objects with optional members can be accessed', () => {
  type TestType = {
    readonly object: {
      readonly stringProp?: string
    }
  }

  type ExpectedType = 'object' | `object.stringProp`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

/* -------------------------------------------------------------------------- */
/*                              Index Signatures                              */
/* -------------------------------------------------------------------------- */

it('Type of index signature gets returned correctly', () => {
  type TestType = {
    [index: string | number]: string
  }

  expectTypeOf<Path<TestType>>().toEqualTypeOf<string | number>()

  type TestType2 = {
    [index: string]: string
  }

  // @ts-expect-error - typescript transforms keyof string index signature to string | number
  assertType<string>(null as unknown as Path<TestType2>)

  type TestType3 = {
    [index: number]: string
  }

  expectTypeOf<Path<TestType3>>().toEqualTypeOf<number>()
})

it('Symbols as index signature gets ignored', () => {
  type TestType = {
    [index: symbol]: string
  }

  expectTypeOf<Path<TestType>>().toEqualTypeOf<never>()

  type TestType2 = {
    [index: string | symbol]: string
  }

  expectTypeOf<Path<TestType2>>().toEqualTypeOf<string | number>()

  type TestType3 = {
    [index: number | symbol]: string
  }

  expectTypeOf<Path<TestType3>>().toEqualTypeOf<number>()

  type TestType4 = {
    [index: string | number | symbol]: string
  }

  expectTypeOf<Path<TestType4>>().toEqualTypeOf<string | number>()
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

  expectTypeOf<Path<TestTyp>>().toEqualTypeOf<ExpectedType>()

  // This works but the returning type of Path is far to broad and ignores the nested structure inside a index signature
  expectTypeOf<Path<TestTyp>>().toEqualTypeOf<string | number>() // should throw an error
  // Typescript simplifies string | `${string}.${string}` to string
  // We can't really do anything about this without sacrificing readability of code completion
})

/* -------------------------------------------------------------------------- */
/*                             Cyclic dependencies                            */
/* -------------------------------------------------------------------------- */

it('Cyclic dependencies are handled correctly', () => {
  type SimpleTestType = {
    a: SimpleTestType
  }

  type SimpleResult = Path<SimpleTestType>

  // It is important, that typescript doesn't throw an error here because of recursion depth
  expectTypeOf<SimpleResult>().toEqualTypeOf<Path<SimpleTestType>>()

  type TestType = {
    a: TestType
    b: [TestType]
    c: TestType[]
    d: {
      e: TestType
    }
    f: TestType2
  }

  type TestType2 = {
    a: TestType
  }

  // @ts-expect-error - the default depth limit is to high for this number of recursions
  type Result = Path<TestType>

  expectTypeOf<Result>().toEqualTypeOf<Path<TestType>>()

  // It works with a reduced depth limit
  type DepthLimitedResult = Path<TestType, 3>

  expectTypeOf<DepthLimitedResult>().toEqualTypeOf<Path<TestType, 3>>()
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

  expectTypeOf<PathValue<typeof test, 'stringProp'>>().toEqualTypeOf<string>()
  expectTypeOf<PathValue<typeof test, 'numberProp'>>().toEqualTypeOf<number>()
  expectTypeOf<PathValue<typeof test, 'booleanProp'>>().toEqualTypeOf<boolean>()
  expectTypeOf<PathValue<typeof test, 'bigintProp'>>().toEqualTypeOf<bigint>()
  expectTypeOf<PathValue<typeof test, 'symbolProp'>>().toEqualTypeOf<symbol>()
  expectTypeOf<PathValue<typeof test, 'undefinedProp'>>().toEqualTypeOf<undefined>()
  expectTypeOf<PathValue<typeof test, 'nullProp'>>().toEqualTypeOf<null>()
  expectTypeOf<PathValue<typeof test, 'unknownProp'>>().toEqualTypeOf<unknown>()
  expectTypeOf<PathValue<typeof test, 'neverProp'>>().toEqualTypeOf<never>()
})

it('Optional members are return with undefined', () => {
  type TestType = {
    optionalProp?: string
  }

  type ExpectedType = string | undefined

  expectTypeOf<PathValue<TestType, 'optionalProp'>>().toEqualTypeOf<ExpectedType>()

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

  expectTypeOf<
    PathValue<TestTypeWithOptionalObject, 'optionalProp'>
  >().toEqualTypeOf<ExpectedTypeWithOptionalObject>()
  expectTypeOf<
    PathValue<TestTypeWithOptionalObject, 'optionalProp.stringProp'>
  >().toEqualTypeOf<ExpectedType>()

  type TestTypeWithOptionalArray = {
    optionalProp?: string[]
  }

  type ExpectedTypeWithOptionalArray = string[] | undefined

  expectTypeOf<
    PathValue<TestTypeWithOptionalArray, 'optionalProp'>
  >().toEqualTypeOf<ExpectedTypeWithOptionalArray>()
  expectTypeOf<PathValue<TestTypeWithOptionalArray, 'optionalProp.0'>>().toEqualTypeOf<
    string | undefined
  >()
})

it('PathValue works with optional (nested) members', () => {
  type TestType = {
    optionalProp?: {
      stringProp: string
    }
  }

  expectTypeOf<PathValue<TestType, 'optionalProp'>>().toEqualTypeOf<
    { stringProp: string } | undefined
  >()
  expectTypeOf<PathValue<TestType, 'optionalProp.stringProp'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with readonly (nested) members', () => {
  type TestType = {
    readonly stringProp: string
  }

  expectTypeOf<PathValue<TestType, 'stringProp'>>().toEqualTypeOf<string>()

  type TestTypeArray = {
    readonly array: readonly string[]
  }

  expectTypeOf<PathValue<TestTypeArray, 'array'>>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<PathValue<TestTypeArray, 'array.0'>>().toEqualTypeOf<string | undefined>()

  type TestTypeTuple = {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  expectTypeOf<PathValue<TestTypeTuple, 'tuple'>>().toEqualTypeOf<readonly ['a', 'b', 'c']>()
  expectTypeOf<PathValue<TestTypeTuple, 'tuple.0'>>().toEqualTypeOf<'a'>()

  type TestTypeObject = {
    readonly object: {
      readonly stringProp: string
    }
  }

  expectTypeOf<PathValue<TestTypeObject, 'object'>>().toEqualTypeOf<{
    readonly stringProp: string
  }>()
  expectTypeOf<PathValue<TestTypeObject, 'object.stringProp'>>().toEqualTypeOf<string>()
})

it('PathValue works with index signatures', () => {
  type TestType = {
    [index: string]: string
  }

  expectTypeOf<PathValue<TestType, string>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, number>>().toEqualTypeOf<string | undefined>()
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

  expectTypeOf<PathValue<TestType, `${string}.${string}`>>().toEqualTypeOf<
    { a: string; b: number } | undefined
  >()
  expectTypeOf<PathValue<TestType, `${string}.${string}.a`>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, `${string}.${string}.b`>>().toEqualTypeOf<number | undefined>()
})

it('PathValue works with arrays', () => {
  type TestType = {
    array: string[]
  }

  expectTypeOf<PathValue<TestType, 'array'>>().toEqualTypeOf<string[]>()
  expectTypeOf<PathValue<TestType, 'array.0'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in arrays', () => {
  type TestType = {
    array: { a: string }[]
  }

  expectTypeOf<PathValue<TestType, 'array'>>().toEqualTypeOf<{ a: string }[]>()
  expectTypeOf<PathValue<TestType, 'array.0'>>().toEqualTypeOf<{ a: string } | undefined>()
  expectTypeOf<PathValue<TestType, 'array.0.a'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in nullable arrays', () => {
  type TestType = {
    array: { a: string; b: number }[] | null
  }

  expectTypeOf<PathValue<TestType, 'array'>>().toEqualTypeOf<{ a: string; b: number }[] | null>()

  expectTypeOf<PathValue<TestType, 'array.0'>>().toEqualTypeOf<
    { a: string; b: number } | undefined
  >()

  expectTypeOf<PathValue<TestType, 'array.0.a'>>().toEqualTypeOf<string | undefined>()

  // @ts-expect-error - c is not a property of { a: string; b: number }
  expectTypeOf<PathValue<TestType, 'array.0.c'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with unions', () => {
  type TestType = {
    union: string | number
  }

  expectTypeOf<PathValue<TestType, 'union'>>().toEqualTypeOf<string | number>()

  type TestType2 = {
    union: string | { a: string }
  }

  expectTypeOf<PathValue<TestType2, 'union'>>().toEqualTypeOf<string | { a: string }>()

  expectTypeOf<PathValue<TestType2, 'union.a'>>().toEqualTypeOf<string>()
})

it('PathValue works with tuples', () => {
  type TestType = {
    tuple: ['a', 'b', 'c']
  }

  expectTypeOf<PathValue<TestType, 'tuple'>>().toEqualTypeOf<['a', 'b', 'c']>()
  expectTypeOf<PathValue<TestType, 'tuple.0'>>().toEqualTypeOf<'a'>()
})

it('PathValue works with objects in tuples', () => {
  type TestType = {
    tuple: [{ a: string }, 'b']
  }

  expectTypeOf<PathValue<TestType, 'tuple.0'>>().toEqualTypeOf<{ a: string }>()
  expectTypeOf<PathValue<TestType, 'tuple.0.a'>>().toEqualTypeOf<string>()

  // @ts-expect-error - 1 is 'b' not { a: string }
  expectTypeOf<PathValue<TestType, 'tuple.1.a'>>().toEqualTypeOf<string>()
})

it('PathValue works with multi-dimensional arrays', () => {
  type TestType = string[][][]

  expectTypeOf<PathValue<TestType, '0.0.0'>>().toEqualTypeOf<string | undefined>()

  type TestType2 = {
    array: { a: string }[][]
  }

  expectTypeOf<PathValue<TestType2, 'array.0.0.a'>>().toEqualTypeOf<string | undefined>()
})
