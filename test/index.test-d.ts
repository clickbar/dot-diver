import { it, assertType } from 'vitest'
import { Path, PathValue } from '../src'

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

    type ExpectedType = 'stringProp' | 'numberProp' | 'booleanProp' | 'bigintProp' | 'symbolProp' | 'undefinedProp' | 'nullProp' | 'unknownProp' | 'neverProp'

    assertType<ExpectedType>(null as unknown as Path<typeof test>)
})

it('Symbols are not allowed members', () => {
    const testSymbol = Symbol()

    const test = {
        [testSymbol]: 'a',
    }

    assertType<never>(null as unknown as Path<typeof test>)
})

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

    type ExpectedTypeWithOptionalObject = {
        stringProp: string
    } | undefined

    assertType<ExpectedTypeWithOptionalObject>(null as unknown as PathValue<TestTypeWithOptionalObject, 'optionalProp'>)
    assertType<ExpectedType>(null as unknown as PathValue<TestTypeWithOptionalObject, 'optionalProp.stringProp'>)

    type TestTypeWithOptionalArray = {
        optionalProp?: string[]
    }

    type ExpectedTypeWithOptionalArray = string[] | undefined

    assertType<ExpectedTypeWithOptionalArray>(null as unknown as PathValue<TestTypeWithOptionalArray, 'optionalProp'>)
    assertType<string | undefined>(null as unknown as PathValue<TestTypeWithOptionalArray, 'optionalProp.0'>)
})

it('Readonly values can be accessed', () => {
    type TestType = {
        readonly stringProp: string
    }

    type ExpectedType = 'stringProp'

    assertType<ExpectedType>(null as unknown as Path<TestType>)
})