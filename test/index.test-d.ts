import { it, assertType } from 'vitest'
import { Path } from '../src'

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
