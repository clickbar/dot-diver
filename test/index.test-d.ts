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
  interface TestType {
    optionalProp?: string
  }

  type ExpectedType = string | undefined

  expectTypeOf<PathValue<TestType, 'optionalProp'>>().toEqualTypeOf<ExpectedType>()

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
    PathValue<TestTypeWithOptionalObject, 'optionalProp'>
  >().toEqualTypeOf<ExpectedTypeWithOptionalObject>()
  expectTypeOf<
    PathValue<TestTypeWithOptionalObject, 'optionalProp.stringProp'>
  >().toEqualTypeOf<ExpectedType>()

  interface TestTypeWithOptionalArray {
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
  interface TestType {
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
  interface TestType {
    readonly stringProp: string
  }

  expectTypeOf<PathValue<TestType, 'stringProp'>>().toEqualTypeOf<string>()

  interface TestTypeArray {
    readonly array: readonly string[]
  }

  expectTypeOf<PathValue<TestTypeArray, 'array'>>().toEqualTypeOf<readonly string[]>()
  expectTypeOf<PathValue<TestTypeArray, 'array.0'>>().toEqualTypeOf<string | undefined>()

  interface TestTypeTuple {
    readonly tuple: readonly ['a', 'b', 'c']
  }

  expectTypeOf<PathValue<TestTypeTuple, 'tuple'>>().toEqualTypeOf<readonly ['a', 'b', 'c']>()
  expectTypeOf<PathValue<TestTypeTuple, 'tuple.0'>>().toEqualTypeOf<'a'>()

  interface TestTypeObject {
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
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface TestType {
    [index: string]: string
  }

  expectTypeOf<PathValue<TestType, string>>().toEqualTypeOf<string | undefined>()
  // This can also be a number, because TypeScript broadens the typing of index signatures to include number.
  // Because both string and number can be used to access the elements of such an object.
  expectTypeOf<PathValue<TestType, number>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with index signatures defined via Record<X,Y>', () => {
  type TestType = Record<string, string>

  expectTypeOf<PathValue<TestType, string>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, number>>().toEqualTypeOf<string | undefined>()
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

  expectTypeOf<PathValue<TestType, `${string}.${string}`>>().toEqualTypeOf<
    { a: string; b: number } | undefined
  >()
  expectTypeOf<PathValue<TestType, `${string}.${string}.a`>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, `${string}.${string}.b`>>().toEqualTypeOf<number | undefined>()
})

it('PathValue works with arrays', () => {
  interface TestType {
    array: string[]
  }

  expectTypeOf<PathValue<TestType, 'array'>>().toEqualTypeOf<string[]>()
  expectTypeOf<PathValue<TestType, 'array.0'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in arrays', () => {
  interface TestType {
    array: { a: string }[]
  }

  expectTypeOf<PathValue<TestType, 'array'>>().toEqualTypeOf<{ a: string }[]>()
  expectTypeOf<PathValue<TestType, 'array.0'>>().toEqualTypeOf<{ a: string } | undefined>()
  expectTypeOf<PathValue<TestType, 'array.0.a'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with objects in nullable arrays', () => {
  interface TestType {
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
  interface TestType {
    union: string | number
  }

  expectTypeOf<PathValue<TestType, 'union'>>().toEqualTypeOf<string | number>()

  interface TestType2 {
    union: string | { a: string }
  }

  expectTypeOf<PathValue<TestType2, 'union'>>().toEqualTypeOf<string | { a: string }>()

  expectTypeOf<PathValue<TestType2, 'union.a'>>().toEqualTypeOf<string | undefined>()
})

it('PathValue works with tuples', () => {
  interface TestType {
    tuple: ['a', 'b', 'c']
  }

  expectTypeOf<PathValue<TestType, 'tuple'>>().toEqualTypeOf<['a', 'b', 'c']>()
  expectTypeOf<PathValue<TestType, 'tuple.0'>>().toEqualTypeOf<'a'>()
})

it('PathValue works with objects in tuples', () => {
  interface TestType {
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

  interface TestType2 {
    array: { a: string }[][]
  }

  expectTypeOf<PathValue<TestType2, 'array.0.0.a'>>().toEqualTypeOf<string | undefined>()
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
  type ValueAtPathA = PathValue<MyObjectType, 'a'> // Output: string
  expectTypeOf<ValueAtPathA>().toEqualTypeOf<string>()

  type ValueAtPathB_C = PathValue<MyObjectType, 'b.c'> // Output: number
  expectTypeOf<ValueAtPathB_C>().toEqualTypeOf<number>()

  type ValueAtPathB_D_E = PathValue<MyObjectType, 'b.d.e'> // Output: boolean
  expectTypeOf<ValueAtPathB_D_E>().toEqualTypeOf<boolean>()

  type ValueAtPathF_0 = PathValue<MyObjectType, 'f.0'> // Output: { g: string }
  expectTypeOf<ValueAtPathF_0>().toEqualTypeOf<{ g: string }>()

  type ValueAtPathF_0_G = PathValue<MyObjectType, 'f.0.g'> // Output: string
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
  type ValueAtPathParent_Id = PathValue<Node, 'parent.id', 2> // Output: number
  expectTypeOf<ValueAtPathParent_Id>().toEqualTypeOf<number>()

  type ValueAtPathChildren_0_Label = PathValue<Node, 'children.0.label', 3> // Output: string | undefined
  expectTypeOf<ValueAtPathChildren_0_Label>().toEqualTypeOf<string | undefined>()

  type ValueAtPathParent_Parent_Parent = PathValue<
    Node,
    'parent.parent.parent.parent',
    3
  > // Output: unknown (due to the depth limit)
  expectTypeOf<ValueAtPathParent_Parent_Parent>().toEqualTypeOf<unknown>()
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
    | `e.${number}.f.g`
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

  expectTypeOf<PathValue<TestType, 'a'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, 'b'>>().toEqualTypeOf<number | undefined>()
  expectTypeOf<PathValue<TestType, 'c'>>().toEqualTypeOf<{ d: string } | undefined>()
  expectTypeOf<PathValue<TestType, 'c.d'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<PathValue<TestType, 'e'>>().toEqualTypeOf<{ f: { g: string } }[] | undefined>()
  expectTypeOf<PathValue<TestType, 'e.0'>>().toEqualTypeOf<{ f: { g: string } } | undefined>()
  expectTypeOf<PathValue<TestType, 'e.0.f'>>().toEqualTypeOf<{ g: string } | undefined>()
  expectTypeOf<PathValue<TestType, 'e.0.f.g'>>().toEqualTypeOf<string | undefined>()
  expectTypeOf<PathValue<TestType, 'e.1.f.g'>>().toEqualTypeOf<string | undefined>()

  expectTypeOf<PathValue<TestType, number>>().toEqualTypeOf<number | (() => void) | undefined>()
  expectTypeOf<PathValue<TestType, `${number}`>>().toEqualTypeOf<
    number | (() => void) | undefined
  >()
})

it('Does not need to add undefined if it is certain that the property exists', () => {
  type TestType = { a: string } | { a: number } | { a: { b: string } } | { a: { b: string }[] }

  type ExpectedValue = string | number | { b: string } | { b: string }[]

  expectTypeOf<PathValue<TestType, 'a'>>().toEqualTypeOf<ExpectedValue>()

  type TestType2 = TestType | { a?: boolean }

  type ExpectedValue2 = ExpectedValue | boolean | undefined

  expectTypeOf<PathValue<TestType2, 'a'>>().toEqualTypeOf<ExpectedValue2>()
})

/* ----------------------------- Readonly Config ---------------------------- */

it('Readonly config works with Path', () => {
  type TestObject = {
    a: string
    readonly b: number
    c: { d: string; readonly e: { f: string } }
    readonly g: { h: string }
    readonly i: { j: string }[]
  }

  type TestObjectExpectedPaths =
    | 'a'
    | 'c'
    | 'c.d'
    | 'c.e.f'
    | 'g.h'
    | `i.${number}`
    | `i.${number}.j`

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
