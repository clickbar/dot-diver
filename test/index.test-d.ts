import { it, expectTypeOf, test } from 'vitest'

import type { Path, GetPathValue, SetPathValue } from '../src'

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
  type TestType = Record<symbol, string>

  expectTypeOf<Path<TestType>>().toEqualTypeOf<never>()
})

/* -------------------------------------------------------------------------- */
/*                                 Array Tests                                */
/* -------------------------------------------------------------------------- */

it('Arrays can be accessed with number', () => {
  const test: string[] = ['a', 'b', 'c']

  expectTypeOf<Path<typeof test>>().toEqualTypeOf<number | `${number}`>()

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
  interface TestType {
    array: { a: string; b: number }[] | null
  }

  type ExpectedType = 'array' | `array.${number}` | `array.${number}.a` | `array.${number}.b`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

/* -------------------------------------------------------------------------- */
/*                                Tuples Tests                                */
/* -------------------------------------------------------------------------- */

it('Tuples can be accessed with number', () => {
  type TestTupleType = ['a', 'b', 'c']
  type ExpectedTuplePaths = 0 | 1 | 2
  type ResultTuplePaths = Path<TestTupleType>

  expectTypeOf<ResultTuplePaths>().toEqualTypeOf<ExpectedTuplePaths>()

  interface TestInterface {
    tuple: TestTupleType
  }

  type ExpectedInterfacePaths = 'tuple' | `tuple.${0 | 1 | 2}`

  type ResultInterfacePaths = Path<TestInterface>

  expectTypeOf<ResultInterfacePaths>().toEqualTypeOf<ExpectedInterfacePaths>()

  // @ts-expect-error - string is not a number
  expectTypeOf<Path<TestTupleType>>().toEqualTypeOf<'tuple' | `tuple.${string}`>()
})

it('Tuples/Arrays with specific length can be accessed with number', () => {
  type TestTupleTypeOfLength1 = [string] // length 1
  type ExpectedTuplePathsOfLength1 = 0
  type ResultTuplePathsOfLength1 = Path<TestTupleTypeOfLength1>

  expectTypeOf<ResultTuplePathsOfLength1>().toEqualTypeOf<ExpectedTuplePathsOfLength1>()

  type TestEmptyArrayType = [] // length 0
  type ExpectedEmptyArrayPaths = never
  type ResultEmptyArrayPaths = Path<TestEmptyArrayType>

  expectTypeOf<ResultEmptyArrayPaths>().toEqualTypeOf<ExpectedEmptyArrayPaths>()

  type TestNotEmptyArray = string[]
  type ExpectedNotEmptyArrayPaths = number | `${number}`
  type ResultNotEmptyArrayPaths = Path<TestNotEmptyArray>

  expectTypeOf<ResultNotEmptyArrayPaths>().toEqualTypeOf<ExpectedNotEmptyArrayPaths>()
})

/* -------------------------------------------------------------------------- */
/*                              Optional Members                              */
/* -------------------------------------------------------------------------- */

it('Paths of optional members gets returned', () => {
  interface TestType {
    optionalProp?: string
  }

  expectTypeOf<Path<TestType>>().toEqualTypeOf<'optionalProp'>()

  interface TestTypeWithOptionalObject {
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

  interface TestTypeWithOptionalArray {
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
  interface TestType {
    readonly stringProp: string
  }

  type ExpectedType = 'stringProp'

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly arrays can be accessed', () => {
  interface TestType {
    readonly array: readonly string[]
  }

  type ExpectedType = 'array' | `array.${number}`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly tuples can be accessed', () => {
  interface TestType {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  type ExpectedType = 'tuple' | `tuple.${0 | 1 | 2}`
  type ResultType = Path<TestType>

  expectTypeOf<ResultType>().toEqualTypeOf<ExpectedType>()
})

it('Readonly objects can be accessed', () => {
  interface TestType {
    readonly object: {
      readonly stringProp: string
    }
  }

  type ExpectedType = 'object' | `object.stringProp`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedType>()
})

it('Readonly objects with optional members can be accessed', () => {
  interface TestType {
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
  type TestType = Record<string | number, string>

  expectTypeOf<Path<TestType>>().toEqualTypeOf<string | number>()

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestType2 {
    [index: string]: string
  }

  // @ts-expect-error - typescript transforms keyof string index signature to string | number
  expectTypeOf<Path<TestType2>>().toEqualTypeOf<string>()

  type TestType3 = Record<number, string>

  expectTypeOf<Path<TestType3>>().toEqualTypeOf<number>()
})

it('Symbols as index signature gets ignored', () => {
  type TestTypeRecord = Record<symbol, string>

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestTypeIndexSignature {
    [index: symbol]: string
  }

  expectTypeOf<Path<TestTypeRecord>>().toEqualTypeOf<never>()
  expectTypeOf<Path<TestTypeIndexSignature>>().toEqualTypeOf<never>()

  type TestTypeRecord2 = Record<string | symbol, string>
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestTypeIndexSignature2 {
    [index: string | symbol]: string
  }

  expectTypeOf<Path<TestTypeRecord2>>().toEqualTypeOf<string>()
  // TypeScript transforms index signature to string | number, while Records will use their generic parameter only
  expectTypeOf<Path<TestTypeIndexSignature2>>().toEqualTypeOf<string | number>()

  type TestTypeRecord3 = Record<number | symbol, string>
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestType3IndexSignature3 {
    [index: number | symbol]: string
  }

  expectTypeOf<Path<TestTypeRecord3>>().toEqualTypeOf<number>()
  expectTypeOf<Path<TestType3IndexSignature3>>().toEqualTypeOf<number>()

  type TestTypeRecord4 = Record<string | number | symbol, string>
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestTypeIndexSignature4 {
    [index: string | number | symbol]: string
  }

  expectTypeOf<Path<TestTypeRecord4>>().toEqualTypeOf<string | number>()
  expectTypeOf<Path<TestTypeIndexSignature4>>().toEqualTypeOf<string | number>()
})

it('Nested Path of nested objects in index signature gets returned correctly', () => {
  type TestTyp = Record<
    string,
    Record<
      string,
      {
        a: string
        b: number
      }
    >
  >

  type ExpectedType =
    | string
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | `${string}.${string}`
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | `${string}.${string}.a`
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | `${string}.${string}.b`

  expectTypeOf<Path<TestTyp>>().toEqualTypeOf<ExpectedType>()

  // This works but the returning type of Path is far too broad and ignores the nested structure inside a index signature
  expectTypeOf<Path<TestTyp>>().toEqualTypeOf<string>()
  // Typescript simplifies string | `${string}.${string}` to string
  // We can't really do anything about this without sacrificing readability of code completion
})

/* -------------------------------------------------------------------------- */
/*                             Cyclic dependencies                            */
/* -------------------------------------------------------------------------- */

it('Cyclic dependencies are handled correctly', () => {
  interface SimpleTestType {
    a: SimpleTestType
  }

  type SimpleResult = Path<SimpleTestType>

  // It is important, that typescript doesn't throw an error here because of recursion depth
  expectTypeOf<SimpleResult>().toEqualTypeOf<Path<SimpleTestType>>()

  interface TestType {
    a: TestType
    b: [TestType]
    c: TestType[]
    d: {
      e: TestType
    }
    f: TestType2
  }

  interface TestType2 {
    a: TestType
  }

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

  expectTypeOf<GetPathValue<typeof test, 'stringProp'>>().toEqualTypeOf<string>()
  expectTypeOf<GetPathValue<typeof test, 'numberProp'>>().toEqualTypeOf<number>()
  expectTypeOf<GetPathValue<typeof test, 'booleanProp'>>().toEqualTypeOf<boolean>()
  expectTypeOf<GetPathValue<typeof test, 'bigintProp'>>().toEqualTypeOf<bigint>()
  expectTypeOf<GetPathValue<typeof test, 'symbolProp'>>().toEqualTypeOf<symbol>()
  expectTypeOf<GetPathValue<typeof test, 'undefinedProp'>>().toEqualTypeOf<undefined>()
  expectTypeOf<GetPathValue<typeof test, 'nullProp'>>().toEqualTypeOf<null>()
  expectTypeOf<GetPathValue<typeof test, 'unknownProp'>>().toEqualTypeOf<unknown>()
  expectTypeOf<GetPathValue<typeof test, 'neverProp'>>().toEqualTypeOf<never>()
})

it('Optional members are return with undefined', () => {
  interface TestType {
    optionalProp?: string
  }

  type ExpectedType = string | undefined

  expectTypeOf<GetPathValue<TestType, 'optionalProp'>>().toEqualTypeOf<ExpectedType>()

  interface TestTypeWithOptionalObject {
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
  GetPathValue<TestTypeWithOptionalObject, 'optionalProp'>
  >().toEqualTypeOf<ExpectedTypeWithOptionalObject>()
  expectTypeOf<
  GetPathValue<TestTypeWithOptionalObject, 'optionalProp.stringProp'>
  >().toEqualTypeOf<ExpectedType>()

  interface TestTypeWithOptionalArray {
    optionalProp?: string[]
  }

  type ExpectedTypeWithOptionalArray = string[] | undefined

  expectTypeOf<
  GetPathValue<TestTypeWithOptionalArray, 'optionalProp'>
  >().toEqualTypeOf<ExpectedTypeWithOptionalArray>()
  expectTypeOf<GetPathValue<TestTypeWithOptionalArray, 'optionalProp.0'>>().toEqualTypeOf<
    string | undefined
  >()
})

it('PathValue works with optional (nested) members', () => {
  interface TestType {
    optionalProp?: {
      stringProp: string
    }
  }

  expectTypeOf<GetPathValue<TestType, 'optionalProp'>>().toEqualTypeOf<
    { stringProp: string } | undefined
  >()
  expectTypeOf<GetPathValue<TestType, 'optionalProp.stringProp'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with readonly (nested) members', () => {
  interface TestType {
    readonly stringProp: string
  }

  expectTypeOf<GetPathValue<TestType, 'stringProp'>>().toEqualTypeOf<string>()

  interface TestTypeArray {
    readonly array: readonly string[]
  }

  expectTypeOf<GetPathValue<TestTypeArray, 'array'>>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<GetPathValue<TestTypeArray, 'array.0'>>().toEqualTypeOf<string | undefined>()

  interface TestTypeTuple {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  expectTypeOf<GetPathValue<TestTypeTuple, 'tuple'>>().toEqualTypeOf<readonly ['a', 'b', 'c']>()
  expectTypeOf<GetPathValue<TestTypeTuple, 'tuple.0'>>().toEqualTypeOf<'a'>()

  interface TestTypeObject {
    readonly object: {
      readonly stringProp: string
    }
  }

  expectTypeOf<GetPathValue<TestTypeObject, 'object'>>().toEqualTypeOf<{
    readonly stringProp: string
  }>()
  expectTypeOf<GetPathValue<TestTypeObject, 'object.stringProp'>>().toEqualTypeOf<string>()
})

it('PathValue works with index signatures', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestType {
    [index: string]: string
  }

  expectTypeOf<GetPathValue<TestType, string>>().toEqualTypeOf<string | undefined>()
  // This can also be a number, because TypeScript broadens the typing of index signatures to include number.
  // Because both string and number can be used to access the elements of such an object.
  expectTypeOf<GetPathValue<TestType, number>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with index signatures defined via Record<X,Y>', () => {
  type TestType = Record<string, string>

  expectTypeOf<GetPathValue<TestType, string>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<GetPathValue<TestType, number>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with nested index signatures', () => {
  type TestType = Record<
    string,
    Record<
      string,
      {
        a: string
        b: number
      }
    >
  >

  expectTypeOf<GetPathValue<TestType, `${string}.${string}`>>().toEqualTypeOf<
    { a: string; b: number } | undefined
  >()
  expectTypeOf<GetPathValue<TestType, `${string}.${string}.a`>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<GetPathValue<TestType, `${string}.${string}.b`>>().toEqualTypeOf<number | undefined>()
})

it('PathValue works with arrays', () => {
  interface TestType {
    array: string[]
  }

  expectTypeOf<GetPathValue<TestType, 'array'>>().toEqualTypeOf<string[]>()
  expectTypeOf<GetPathValue<TestType, 'array.0'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in arrays', () => {
  interface TestType {
    array: { a: string }[]
  }

  expectTypeOf<GetPathValue<TestType, 'array'>>().toEqualTypeOf<{ a: string }[]>()
  expectTypeOf<GetPathValue<TestType, 'array.0'>>().toEqualTypeOf<{ a: string } | undefined>()
  expectTypeOf<GetPathValue<TestType, 'array.0.a'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in nullable arrays', () => {
  interface TestType {
    array: { a: string; b: number }[] | null
  }

  expectTypeOf<GetPathValue<TestType, 'array'>>().toEqualTypeOf<{ a: string; b: number }[] | null>()

  expectTypeOf<GetPathValue<TestType, 'array.0'>>().toEqualTypeOf<
    { a: string; b: number } | undefined
  >()

  expectTypeOf<GetPathValue<TestType, 'array.0.a'>>().toEqualTypeOf<string | undefined>()

  // @ts-expect-error - c is not a property of { a: string; b: number }
  expectTypeOf<GetPathValue<TestType, 'array.0.c'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with unions', () => {
  interface TestType {
    union: string | number
  }

  expectTypeOf<GetPathValue<TestType, 'union'>>().toEqualTypeOf<string | number>()

  interface TestType2 {
    union: string | { a: string }
  }

  expectTypeOf<GetPathValue<TestType2, 'union'>>().toEqualTypeOf<string | { a: string }>()

  expectTypeOf<GetPathValue<TestType2, 'union.a'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with tuples', () => {
  interface TestType {
    tuple: ['a', 'b', 'c']
  }

  expectTypeOf<GetPathValue<TestType, 'tuple'>>().toEqualTypeOf<['a', 'b', 'c']>()
  expectTypeOf<GetPathValue<TestType, 'tuple.0'>>().toEqualTypeOf<'a'>()
})

it('PathValue works with objects in tuples', () => {
  interface TestType {
    tuple: [{ a: string }, 'b']
  }

  expectTypeOf<GetPathValue<TestType, 'tuple.0'>>().toEqualTypeOf<{ a: string }>()
  expectTypeOf<GetPathValue<TestType, 'tuple.0.a'>>().toEqualTypeOf<string>()

  // @ts-expect-error - 1 is 'b' not { a: string }
  expectTypeOf<GetPathValue<TestType, 'tuple.1.a'>>().toEqualTypeOf<string>()
})

it('PathValue works with multi-dimensional arrays', () => {
  type TestType = string[][][]

  expectTypeOf<GetPathValue<TestType, '0.0.0'>>().toEqualTypeOf<string | undefined>()

  interface TestType2 {
    array: { a: string }[][]
  }

  expectTypeOf<GetPathValue<TestType2, 'array.0.0.a'>>().toEqualTypeOf<string | undefined>()
})

/* -------------------------------------------------------------------------- */
/*                                Readme Tests                                */
/* -------------------------------------------------------------------------- */

it('Test readme usage example: 🛣️ Path and 🔖 PathValue', () => {
  // Define a sample object type with nested properties
  interface MyObjectType {
    a: string
    b: {
      c: number
      d: {
        e: boolean
      }
    }
    f: [{ g: string }, { g: string }]
  }

  // Example 1: Using the Path type
  type MyObjectPaths = Path<MyObjectType>

  // MyObjectPaths will be a union type representing all valid paths in dot notation:
  // 'a' | 'b' | 'f' | 'b.c' | 'b.d' | 'b.d.e' | 'f.0' | 'f.1' | 'f.0.g' | 'f.1.g'
  expectTypeOf<MyObjectPaths>().toEqualTypeOf<
    'a' | 'b' | 'f' | 'b.c' | 'b.d' | 'b.d.e' | 'f.0' | 'f.1' | 'f.0.g' | 'f.1.g'
  >()

  // Example 2: Using the PathValue type
  type ValueAtPathA = GetPathValue<MyObjectType, 'a'> // Output: string
  expectTypeOf<ValueAtPathA>().toEqualTypeOf<string>()

  type ValueAtPathB_C = GetPathValue<MyObjectType, 'b.c'> // Output: number
  expectTypeOf<ValueAtPathB_C>().toEqualTypeOf<number>()

  type ValueAtPathB_D_E = GetPathValue<MyObjectType, 'b.d.e'> // Output: boolean
  expectTypeOf<ValueAtPathB_D_E>().toEqualTypeOf<boolean>()

  type ValueAtPathF_0 = GetPathValue<MyObjectType, 'f.0'> // Output: { g: string }
  expectTypeOf<ValueAtPathF_0>().toEqualTypeOf<{ g: string }>()

  type ValueAtPathF_0_G = GetPathValue<MyObjectType, 'f.0.g'> // Output: string
  expectTypeOf<ValueAtPathF_0_G>().toEqualTypeOf<string>()
})

it('Test readme usage example: 🔄 Objects with cyclic dependency', () => {
  // Define an object type with nested properties and a cyclic dependency
  interface Node {
    id: number
    label: string
    parent: Node
    children: Node[]
  }

  // Example 1: Using the Path type with a Depth limit
  type NodePathsDepth2 = Path<Node, never, { depth: 2 }> // Depth limit of 2

  // NodePathsDepth2 will be a union type representing all valid paths in dot notation up to a depth of 2:
  // 'id' | 'label' | 'parent' | 'children' | 'parent.id' | 'parent.label' | 'parent.parent' | 'parent.children' | `parent.parent.${any}` | `parent.children.${any}` | `children.${number}` | `children.${number}.${any}`
  expectTypeOf<NodePathsDepth2>().toEqualTypeOf<
    | 'id'
    | 'label'
    | 'parent'
    | 'children'
    | 'parent.id'
    | 'parent.label'
    | 'parent.parent'
    | 'parent.children'
    | `parent.parent.${any}`
    | `parent.children.${any}`
    | `children.${number}`
    | `children.${number}.${any}`
  >()

  // Example 2: Using the PathValue type with a Depth limit
  type ValueAtPathParent_Id = GetPathValue<Node, 'parent.id'> // Output: number
  expectTypeOf<ValueAtPathParent_Id>().toEqualTypeOf<number>()

  type ValueAtPathChildren_0_Label = GetPathValue<Node, 'children.0.label'> // Output: string | undefined
  expectTypeOf<ValueAtPathChildren_0_Label>().toEqualTypeOf<string | undefined>()
})

/* ------------------------------- Union Test ------------------------------- */
it('Can extract all possible paths from a union of types', () => {
  type TestType =
    | { a: string }
    | { b: number }
    | { c: { d: string } }
    | { e: { f: { g: string } }[] }
    | number[]
    | (() => void)[]

  type ExpectedPaths =
    | 'a'
    | 'b'
    | 'c'
    | 'c.d'
    | 'e'
    | `e.${number}`
    | `e.${number}.f`
    | `e.${number}.f.${any}`
    | number
    | `${number}`

  expectTypeOf<Path<TestType>>().toEqualTypeOf<ExpectedPaths>
})

it('Adds undefined if it is uncertain if the property exists', () => {
  type TestType =
    | { a: string }
    | { b: number }
    | { c: { d: string } }
    | number[]
    | { e: { f: { g: string } }[] }
    | (() => void)[]

  expectTypeOf<GetPathValue<TestType, 'a'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<GetPathValue<TestType, 'b'>>().toEqualTypeOf<number | undefined>()
  expectTypeOf<GetPathValue<TestType, 'c'>>().toEqualTypeOf<{ d: string } | undefined>()
  expectTypeOf<GetPathValue<TestType, 'c.d'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<GetPathValue<TestType, 'e'>>().toEqualTypeOf<{ f: { g: string } }[] | undefined>()
  expectTypeOf<GetPathValue<TestType, 'e.0'>>().toEqualTypeOf<{ f: { g: string } } | undefined>()
  expectTypeOf<GetPathValue<TestType, 'e.0.f'>>().toEqualTypeOf<{ g: string } | undefined>()
  expectTypeOf<GetPathValue<TestType, 'e.0.f.g'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<GetPathValue<TestType, 'e.1.f.g'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<GetPathValue<TestType, number>>().toEqualTypeOf<number | (() => void) | undefined>()
  expectTypeOf<GetPathValue<TestType, `${number}`>>().toEqualTypeOf<
    number | (() => void) | undefined
  >()
})

it('Does not need to add undefined if it is certain that the property exists', () => {
  type TestType = { a: string } | { a: number } | { a: { b: string } } | { a: { b: string }[] }

  type ExpectedValue = string | number | { b: string } | { b: string }[]

  expectTypeOf<GetPathValue<TestType, 'a'>>().toEqualTypeOf<ExpectedValue>()

  type TestType2 = TestType | { a?: boolean }

  type ExpectedValue2 = ExpectedValue | boolean | undefined

  expectTypeOf<GetPathValue<TestType2, 'a'>>().toEqualTypeOf<ExpectedValue2>()
})

/**
 * We added onlyWriteable to the config to allow only writeable properties to be set.
 * @see https://github.com/clickbar/dot-diver/issues/3
 */
test('Readonly config works with Path', () => {
  type TestObject = {
    a: string
    readonly b: number
    c: { d: string; readonly e: { f: string } }
    readonly g: { h: string }
    readonly i: { j: string }[]
    k: readonly { l: string }[]
  }

  type TestObjectExpectedPaths =
    | 'a'
    | 'c'
    | 'c.d'
    | 'c.e.f'
    | 'g.h'
    | `i.${number}`
    | `i.${number}.j`
    | `k`
    | `k.${number}.l`

  type TestObjectPathsResult = Path<TestObject, never, { onlyWriteable: true }>

  expectTypeOf<TestObjectPathsResult>().toEqualTypeOf<TestObjectExpectedPaths>()

  type TestArray = readonly { a: number }[]

  type TestArrayExpectedPaths = `${number}.a`

  type TestArrayResult = Path<TestArray, never, { onlyWriteable: true }>

  expectTypeOf<TestArrayResult>().toEqualTypeOf<TestArrayExpectedPaths>()

  type TestTuple = readonly [{ a: string }, { b: number }, { c: boolean }]

  type TestTupleExpectedPaths = '0.a' | '1.b' | '2.c'

  type TestTupleResult = Path<TestTuple, never, { onlyWriteable: true }>

  expectTypeOf<TestTupleResult>().toEqualTypeOf<TestTupleExpectedPaths>()

  interface TestInterface {
    a: string
    readonly b: number
    c: { d: string; readonly e: { f: string } }
    readonly g: { h: string }
    readonly i: { j: string }[]
  }

  type TestInterfaceExpectedPaths =
    | 'a'
    | 'c'
    | 'c.d'
    | 'c.e.f'
    | 'g.h'
    | `i.${number}`
    | `i.${number}.j`

  type TestInterfaceResult = Path<TestInterface, never, { onlyWriteable: true }>

  expectTypeOf<TestInterfaceResult>().toEqualTypeOf<TestInterfaceExpectedPaths>()

  type TestUnion = TestObject | TestArray | TestTuple | TestInterface

  type TestUnionExpectedPaths =
    | TestObjectExpectedPaths
    | TestArrayExpectedPaths
    | TestTupleExpectedPaths
    | TestInterfaceExpectedPaths

  type TestUnionResult = Path<TestUnion, never, { onlyWriteable: true }>

  expectTypeOf<TestUnionResult>().toEqualTypeOf<TestUnionExpectedPaths>()
})

/**
 * Test cases for union types.
 * 'undefined' gets added as a type, if we traverse through a union and one of the members does not have the property
 * referenced by the given path.
 *
 * @see https://github.com/clickbar/dot-diver/issues/4
 */
test('PathValue properly handles union types', () => {
  type TestObject = {
    a: string | { b: number }
    c: { d: string | { e: boolean } }
    f: [{ g: string; h: number } | { g: number; h: number; i: boolean }]
    j: { k: string }[] | number
    l: string | string[]
  }

  expectTypeOf<GetPathValue<TestObject, 'a'>>().toEqualTypeOf<string | { b: number }>()
  expectTypeOf<GetPathValue<TestObject, 'a.b'>>().toEqualTypeOf<number | undefined>()

  expectTypeOf<GetPathValue<TestObject, 'c.d'>>().toEqualTypeOf<string | { e: boolean }>()
  expectTypeOf<GetPathValue<TestObject, 'c.d.e'>>().toEqualTypeOf<boolean | undefined>()

  expectTypeOf<GetPathValue<TestObject, 'f.0'>>().toEqualTypeOf<
    { g: string; h: number } | { g: number; h: number; i: boolean }
  >()
  expectTypeOf<GetPathValue<TestObject, 'f.0.g'>>().toEqualTypeOf<string | number>()
  expectTypeOf<GetPathValue<TestObject, 'f.0.h'>>().toEqualTypeOf<number>()
  expectTypeOf<GetPathValue<TestObject, 'f.0.i'>>().toEqualTypeOf<boolean | undefined>()

  expectTypeOf<GetPathValue<TestObject, 'j'>>().toEqualTypeOf<{ k: string }[] | number>()
  expectTypeOf<GetPathValue<TestObject, 'j.0.k'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<GetPathValue<TestObject, 'l'>>().toEqualTypeOf<string | string[]>()
  expectTypeOf<GetPathValue<TestObject, 'l.0'>>().toEqualTypeOf<string | undefined>()
})

/**
 * Path will only return paths, starting from the last point in the offset.
 * This enhances performance, since we only need to look a few levels ahead, instead of the whole object.
 * This also fixes path truncating partially, if the truncating part is included in the offset.
 *
 * @see https://github.com/clickbar/dot-diver/issues/2
 */
it('Returns correct paths after offset', () => {
  type User = {
    name: string
    age: number
    address: {
      street: string
      city: string
      country: string
    }
    friends: User[]
    relations: Record<string, User>
  }

  type NestedAddressPaths = Path<User, 'address.'>

  expectTypeOf<NestedAddressPaths>().toEqualTypeOf<
    'address.street' | 'address.city' | 'address.country'
  >()

  type NestedRelationsPaths = Path<User, 'relations.'>

  expectTypeOf<NestedRelationsPaths>().toEqualTypeOf<`relations.${string}`>()

  /**
   * We only use a depth of 1 here, for an easier comparison.
   * This also checks for https://github.com/clickbar/dot-diver/issues/2 since the path gets no longer
   * truncated after the 'relations' property.
   */
  type PathsOfNestedRelation = Path<User, 'relations.mother.', { depth: 1 }>

  type ExpectedPathsOfNestedRelation =
    | `relations.mother.name`
    | `relations.mother.age`
    | `relations.mother.address`
    | `relations.mother.address.${any}`
    | `relations.mother.friends`
    | `relations.mother.friends.${any}`
    | `relations.mother.relations`
    | `relations.mother.relations.${any}`

  expectTypeOf<PathsOfNestedRelation>().toEqualTypeOf<ExpectedPathsOfNestedRelation>()
})

/**
 * We handle an empty path by returning the object itself instead of a property of the object.
 * This diverges from the default behavior, but is probably more intuitive and useful in most cases.
 *
 * @see https://github.com/clickbar/dot-diver/issues/30
 */
it('Returns the object itself if the path is empty', () => {
  type TestType = { a: string }

  expectTypeOf<GetPathValue<TestType, ''>>().toEqualTypeOf<TestType>()
})



test('PathValue returns unknown if we exceed its depth limit', () => {
  type TestA = {
    b: TestB
  }

  type TestB = {
    a: TestA
  }

  expectTypeOf<GetPathValue<TestA, 'b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a'>>().toEqualTypeOf<TestA>()
  expectTypeOf<GetPathValue<TestA, 'b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b.a.b'>>().toBeUnknown()
})

test('SetPathValue vs GetPathValue', () => {
  // test noUncheckedUnionAccess
  type TypeWithUnion = {
    a: number | { nested: string }
    b: number | { nested: string | undefined }
  }

  expectTypeOf<GetPathValue<TypeWithUnion, 'a.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithUnion, 'a.nested'>>().toEqualTypeOf<string>()

  expectTypeOf<GetPathValue<TypeWithUnion, 'b.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithUnion, 'b.nested'>>().toEqualTypeOf<string | undefined>()

  // test noUncheckedOptionalAccess
  type TypeWithOptionalProperties = {
    a?: number
    b?: { nested: string }
    c?: { nested: string | undefined }
  }

  expectTypeOf<GetPathValue<TypeWithOptionalProperties, 'a'>>().toEqualTypeOf<number | undefined>()
  expectTypeOf<SetPathValue<TypeWithOptionalProperties, 'a'>>().toEqualTypeOf<number | undefined>()

  expectTypeOf<GetPathValue<TypeWithOptionalProperties, 'b.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithOptionalProperties, 'b.nested'>>().toEqualTypeOf<string>()

  expectTypeOf<GetPathValue<TypeWithOptionalProperties, 'c.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithOptionalProperties, 'c.nested'>>().toEqualTypeOf<string | undefined>()

  // test noUncheckedIndexAccess
  type TypeWithArray = {
    a: number[]
    b: { nested: string }[]
    c: { nested: string | undefined }
    d: Record<string, string>
    e: Record<string, string | undefined>
  }

  expectTypeOf<GetPathValue<TypeWithArray, 'a.0'>>().toEqualTypeOf<number | undefined>()
  expectTypeOf<SetPathValue<TypeWithArray, 'a.0'>>().toEqualTypeOf<number>()

  expectTypeOf<GetPathValue<TypeWithArray, 'b.0.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithArray, 'b.0.nested'>>().toEqualTypeOf<string>()

  expectTypeOf<GetPathValue<TypeWithArray, 'c.nested'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithArray, 'c.nested'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<GetPathValue<TypeWithArray, 'd.key'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithArray, 'd.key'>>().toEqualTypeOf<string>()

  expectTypeOf<GetPathValue<TypeWithArray, 'e.key'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<SetPathValue<TypeWithArray, 'e.key'>>().toEqualTypeOf<string | undefined>()
})
