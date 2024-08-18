/* -------------------------------------------------------------------------- */
/*                                Utility Types                               */
/* -------------------------------------------------------------------------- */

/**
 * Check if two types are equal
 * from type-fest
 * @see https://github.com/sindresorhus/type-fest/blob/fa1c3f3cf49c4d5aae9da47c04320d1934cb2f9b/source/is-equal.d.ts#L29
 */
export type IsEqual<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false

type IsNullableOrUndefinable<T> = null extends T ? true : undefined extends T ? true : false

// Removes all possible index signatures from a type
type FilterIndexSignatureType<T> = string extends T
  ? never
  : number extends T
    ? never
    : symbol extends T
      ? never
      : T

type RemoveIndexSignature<T> = {
  [K in keyof T as FilterIndexSignatureType<K>]: T[K]
}

type HasIndexSignature<T> = string extends keyof T
  ? true
  : number extends keyof T
    ? true
    : symbol extends keyof T
      ? true
      : false

type GetValidIndexSignature<T> =
  Exclude<keyof T, symbol> extends infer K ? (K extends string | number ? K : never) : never

// Keys have to be strings or number and can't contain a dot since we won't be able to differ between and key with a dot and a nested key
type RemoveInvalidDotPathKeys<T> = T extends symbol
  ? never
  : T extends number
    ? T
    : T extends string
      ? T extends `${infer _K}.${infer _R}`
        ? never
        : T
      : never

type IsArray<T> = T extends readonly any[] ? true : false

// @see https://github.com/sindresorhus/type-fest/blob/2967fe62b55c7cc13fa003259e119f98edeb9c28/source/internal/array.d.ts#L93
type ArrayIsReadonlyArray<T> = T extends unknown[] ? false : true

type GetArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * @link https://stackoverflow.com/a/49928360/1490091
 */
type IsAny<T> = 0 extends 1 & T ? true : false

type IsNever<T> = [T] extends [never] ? true : false

/**
 * @link https://github.com/sindresorhus/type-fest
 */
type IsUnknown<T> =
  IsNever<T> extends true ? false : IsAny<T> extends true ? false : unknown extends T ? true : false

type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | undefined | null
  ? true
  : false

type ExcludeNullUndefined<T> = Exclude<T, null | undefined>

type IsEmptyArray<T> = T extends readonly [] ? true : false

type IsTuple<T> = T extends readonly [any, ...any[]] ? true : false

type TupleLength<T> = T extends { length: infer L } ? (L extends number ? L : never) : never

type TupleElement<T, N> = N extends keyof T ? T[N] : never

// remove readonly modifier from all members of a record
type Writeable<T> = {
  -readonly [K in keyof T]: T[K]
}

// @see https://github.com/sindresorhus/type-fest/blob/2967fe62b55c7cc13fa003259e119f98edeb9c28/source/writable-keys-of.d.ts#L28
type RemoveReadonlyProperties<T> = {
  [K in keyof T as IsEqual<{ [k in K]: T[K] }, { readonly [k in K]: T[K] }> extends false
    ? K
    : never]: T[K]
}

type BeforeLast<T extends string, V extends string | number> = T extends string
  ? T extends `${infer H}${V}${infer R}`
    ? R extends `${string}${V}${string}`
      ? `${H}${V}${BeforeLast<R, V>}`
      : H
    : T
  : never

/* -------------------------------------------------------------------------- */
/*                                 Math Types                                 */
/* -------------------------------------------------------------------------- */
// We use a tuple to carry our value

type MinusOne<N extends unknown[]> = N extends [...infer U, unknown] ? U : []

type BuildTuple<L extends number, T extends unknown[] = []> = T extends {
  length: L
}
  ? T
  : BuildTuple<L, [...T, unknown]>

/* -------------------------------------------------------------------------- */
/*                                 Path Types                                 */
/* -------------------------------------------------------------------------- */

// get all possible paths of an object
type GetObjectPaths<T, DepthCarry extends unknown[], Config extends BasePathConfig> =
  | (Config['onlyWriteable'] extends true
      ? RemoveInvalidDotPathKeys<keyof RemoveReadonlyProperties<T>>
      : RemoveInvalidDotPathKeys<keyof T>)
  | (keyof T extends infer K
      ? K extends keyof T
        ? `${RemoveInvalidDotPathKeys<K>}.${TraversalGate<T[K], DepthCarry, Config>}`
        : never
      : never)

// get all possible paths of an array
type GetArrayPaths<T, DepthCarry extends unknown[], Config extends BasePathConfig> =
  | (Config['onlyWriteable'] extends true
      ? ArrayIsReadonlyArray<T> extends true
        ? never
        : number | `${number}`
      : number | `${number}`)
  | `${number}.${TraversalGate<GetArrayElement<T>, DepthCarry, Config>}`

// get all possible paths of a tuple
type GetTuplePaths<T, DepthCarry extends unknown[], Config extends BasePathConfig> =
  Extract<keyof T, `${number}`> extends infer P
    ? P extends `${infer PV extends number}`
      ?
          | (Config['onlyWriteable'] extends true
              ? ArrayIsReadonlyArray<T> extends true
                ? never
                : PV
              : PV)
          | `${PV}.${TraversalGate<TupleElement<T, PV>, DepthCarry, Config>}`
      : never
    : never

/**
 * PathConfig is a configuration object that can be used to configure the behavior of the path function.
 *
 * @property onlyWriteable - If true, only writeable properties are returned
 * @property depth - The maximum depth the path function should traverse
 */
interface BasePathConfig {
  depth: number
  onlyWriteable: boolean
}

// Default configuration
interface GetByPathConfig extends BasePathConfig {
  depth: 3
  onlyWriteable: false
}

interface SetByPathConfig extends BasePathConfig {
  depth: 3
  onlyWriteable: true
}

/**
 * Checks if a given value of type Type is an actual value of the type.
 * E.g. if Type is number and Value is 5, it will return 5.
 * If Type is number and Value is string, it will return Default.
 * If Type is number and Value is number, it will return Default.
 */
type GetActualValue<Type, Value, Default> = [Value] extends [Type]
  ? [Type] extends [Value]
    ? Default
    : Value
  : Default

type PathConfig<Config extends Partial<BasePathConfig>> = {
  depth: GetActualValue<number, Config['depth'], 3>
  onlyWriteable: GetActualValue<boolean, Config['onlyWriteable'], false>
}

/* -------------------------------------------------------------------------- */
/*                                 Simple Path                                */
/* -------------------------------------------------------------------------- */
/**
 * Simple Path return all paths in the given type and returns them until it reaches its max depth.
 * It works by recursively traversing each property of the current object until it reaches a primitive.
 *
 * Since Typescript could include cyclic types, e.g.
 *
 * type CyclicType = {
 *  cycle: CyclicType
 *  ...
 * }
 *
 * we limit the depth. We can archive this by constructing a tuple the size of the max depth we want to go,
 * and removing one element whenever we go one level deeper. As soon as the tuple is empty, we stop traversing,
 *
 *
 */

/**
 * Checks the given generic Parameter T for its type
 * and chooses an appropriate traversal strategy to find further paths.
 *
 * @typeParam T - Type to check
 * @typeParam DepthCarry - Tuple that is the size of the remaining depth level
 * @typeParam Config - Configuration object
 */
type TraversalStep<T, DepthCarry extends unknown[], Config extends BasePathConfig> =
  IsTuple<T> extends true
    ? GetTuplePaths<T, DepthCarry, Config>
    : IsArray<T> extends true
      ? GetArrayPaths<T, DepthCarry, Config>
      : HasIndexSignature<T> extends true
        ? GetValidIndexSignature<T> | GetObjectPaths<RemoveIndexSignature<T>, DepthCarry, Config>
        : GetObjectPaths<T, DepthCarry, Config>

/**
 * Checks for the remaining depth level and stops further traversal if necessary.
 * Reduces the depth level by one if it traverse deeper.
 * Removes problematic modifiers like readonly or undefined, null union types from it.
 *
 * @typeParam T - Type to check
 * @typeParam DepthCarry - Tuple that is the size of the remaining depth level
 * @typeParam Config - Configuration object
 */
type TraversalGate<T, DepthCarry extends unknown[], Config extends BasePathConfig> = T extends T // spread the union if it is one
  ? IsAny<T> extends true
    ? string
    : IsUnknown<T> extends true
      ? never
      : IsPrimitive<T> extends true
        ? never
        : IsEmptyArray<T> extends true
          ? never
          : TupleLength<DepthCarry> extends 0
            ? any
            : TraversalStep<ExcludeNullUndefined<T>, MinusOne<DepthCarry>, Config>
  : never

/**
 * Simple Path return all paths in the given type and returns them until it reaches its max depth.
 *
 * @typeParam T - Type to traverse
 * @typeParam Config - Configuration object
 */
type SimplePath<T, Config extends BasePathConfig> = TraversalGate<
  T,
  BuildTuple<Config['depth']>,
  Config
>

/* -------------------------------------------------------------------------- */
/*                                    Path                                    */
/* -------------------------------------------------------------------------- */

/**
 * Similar to SimplePath, PathWithOffset return all paths in the given type and returns them until it reaches its max depth.
 *
 * The difference is that PathWithOffset allows to specify an offset to start the traversal from. It will start the traversal
 * by the last parent in the given offset.
 *
 * a.b.c.d
 *     ^- return possible paths from here
 *
 * @typeParam T - Type to traverse
 * @typeParam Config - Configuration object
 * @typeParam Offset - Offset path
 */
type PathWithOffset<T, Config extends BasePathConfig, Offset extends string | number> =
  IsAny<Offset> extends true
    ? SimplePath<T, Config>
    : IsNever<Offset> extends true
      ? SimplePath<T, Config>
      : Offset extends `${string}.${string}`
        ? BeforeLast<Offset, '.'> extends infer H
          ? H extends string | number
            ? PathValue<T, H, GetByPathValuePathConfig> extends infer V
              ? IsNever<V> extends true
                ? SimplePath<T, Config>
                : `${H}.${SimplePath<V, Config>}`
              : SimplePath<T, Config>
            : never
          : never
        : SimplePath<T, Config>

/**
 *
 * CircularConstraintPathHelper allows us to use Path as a cyclic constraint for a generic parameter. e.g.
 * function foo<T, P extends CircularConstraintPathHelper<T, 3, [P]>>(...)
 *
 * This allows us to use the given path as the offset parameter for the path type.
 *
 * TODO: Find out why this works and if it may break in the future.
 *
 * @typeParam T - Type to traverse
 * @typeParam P - Should be a tuple with the path to traverse from as its only element, e.g. [P]
 * @typeParam Config - Configuration object
 */
type CircularConstraintPathHelper<
  T,
  Config extends BasePathConfig,
  P extends unknown[],
> = P[number] extends never
  ? SimplePath<T, Config>
  : P[number] extends infer PV
    ? PV extends string | number
      ? PathWithOffset<T, Config, PV>
      : SimplePath<T, Config>
    : SimplePath<T, Config>

/**
 * Path return all paths in the given type and returns them until it reaches its max depth.
 *
 * It uses the given path as the offset to start the traversal from.
 *
 * @typeParam T - Type to traverse
 * @typeParam Offset - Path to start the traversal from
 * @typeParam Config - Configuration object
 *
 */
type Path<
  T,
  Offset = never,
  Config extends Partial<BasePathConfig> = GetByPathConfig,
> = CircularConstraintPathHelper<T, PathConfig<Config>, [Offset]>

/* -------------------------------------------------------------------------- */
/*                                 Path Value                                 */
/* -------------------------------------------------------------------------- */

/**
 * ValuePathConfig is a configuration object that can be used to configure the behavior of the path function.
 *
 * @property onlyWriteable - If true, only writeable properties are returned
 * @property depth - The maximum depth the path function should traverse
 */
interface ValueBasePathConfig {
  noUncheckedUnionAccess: boolean // if true, return undefined if accessing a nested property of a union, which is not present in all union members
  noUncheckedIndexAccess: boolean // if true, return undefined if accessing an array element
  noUncheckedOptionalAccess: boolean // if true, return undefined if accessing a property on an optional or nullable object
}

// Default configuration
interface GetByPathValuePathConfig extends BasePathConfig {
  noUncheckedUnionAccess: true
  noUncheckedIndexAccess: true
  noUncheckedOptionalAccess: true
}

interface SetByPathValuePathConfig extends BasePathConfig {
  noUncheckedUnionAccess: false
  noUncheckedIndexAccess: false
  noUncheckedOptionalAccess: false
}

type ValueTraversalStep<T, P, DepthCarry extends unknown[], Config extends ValueBasePathConfig> =
  IsAny<T> extends true
    ? any
    : IsUnknown<T> extends true
      ? unknown
      : IsNullableOrUndefinable<T> extends true
        ? ValueTraversalGate<ExcludeNullUndefined<T>, P, DepthCarry, Config> | Config['noUncheckedOptionalAccess'] extends true ? undefined : never
        : IsTuple<T> extends true
          ? P extends `${infer H extends number}.${infer R}`
            ? ValueTraversalGate<TupleElement<T, H>, R, DepthCarry, Config>
            : P extends `${infer K extends number}`
              ? TupleElement<T, K>
              : Config['noUncheckedUnionAccess'] extends true ? undefined : never
          : IsArray<T> extends true
            ? P extends `${infer _H extends number}.${infer R}`
              ? ValueTraversalGate<GetArrayElement<T>, R, DepthCarry, Config> | (Config['noUncheckedIndexAccess'] extends true ? undefined : never)
              : P extends `${infer _K extends number}`
                ? GetArrayElement<T> | (Config['noUncheckedIndexAccess'] extends true ? undefined : never)
                : Config['noUncheckedUnionAccess'] extends true ? undefined : never
            : P extends `${infer H}.${infer R}`
              ? H extends keyof T
                ?
                    | ValueTraversalGate<T[H], R, DepthCarry, Config>
                    | (HasIndexSignature<T> extends true ? (Config['noUncheckedIndexAccess'] extends true ? undefined : never) : never)
                : Config['noUncheckedUnionAccess'] extends true ? undefined : never
              : P extends keyof T
                ? T[P] | (HasIndexSignature<T> extends true ? (Config['noUncheckedIndexAccess'] extends true ? undefined : never) : never)
                : Config['noUncheckedUnionAccess'] extends true ? undefined : never

type ValueTraversalGate<T, P, DepthCarry extends unknown[], Config extends ValueBasePathConfig> =
  TupleLength<DepthCarry> extends 0
    ? unknown
    : T extends T
      ? ValueTraversalStep<Writeable<T>, P, MinusOne<DepthCarry>, Config>
      : never

type PathValue<T, P extends string | number, Config extends ValueBasePathConfig> = P extends ''
  ? T
  : ValueTraversalGate<T, `${P}`, BuildTuple<40>, Config>

type GetPathValue<T, P extends string | number> = PathValue<T, P, GetByPathValuePathConfig>
type SetPathValue<T, P extends string | number> = PathValue<T, P, SetByPathValuePathConfig>

type SafeObject = Record<string, unknown>
type SearchableObject = object

// eslint-disable-next-line @typescript-eslint/unbound-method
const hasOwnProperty = Object.prototype.hasOwnProperty

function isValidObjectAlongPath(current: unknown): boolean {
  return (
    current !== null &&
    current !== undefined &&
    (typeof current === 'object' || typeof current === 'function')
  )
}

/**
 * Retrieves a value from an object by dot notation
 *
 * @param object - object to get value from
 * @param path - path to value
 *
 * @privateRemarks
 * The intersection between Path<T, P>  and string is necessary for TypeScript to successfully narrow down the type of P based on the user-provided path input.
 * Without the intersection, the path would just be of type Path<T, P> and PathValue would be a union of all possible return types.
 * By using the intersection, TypeScript is forced to apply the Path constraints and infer the type from the provided user input.
 */
function getByPath<T extends SearchableObject, P extends '' | Path<T, P>>(
  object: T,
  path: P & string, // required so type gets narrowed down from its union of possible paths to its actual value. TODO: Find Ts-Issue or similar why this is required.
): GetPathValue<T, P> {
  if (path === '') {
    return object as GetPathValue<T, P>
  }

  const pathArray = path.split('.')

  return pathArray.reduce((current: unknown, pathPart) => {
    if (
      !isValidObjectAlongPath(current)
      || (current as SafeObject)[pathPart] === undefined
      || !hasOwnProperty.call(current, pathPart)
      ) {
      return undefined
    }

    return (current as SafeObject)[pathPart]
  }, object) as GetPathValue<T, P>
}

function throwAssignmentError(current: unknown, path: string): never {
  const type = current === null ? 'null' : typeof current
  throw new TypeError(`Cannot create property '${path}' on ${type}`)
}

/**
 * Sets a value in an object by dot notation. If an intermediate property is undefined,
 * this function will throw an error.
 *
 * @param object - object to set value in
 * @param path - path to value
 * @param value - value to set
 *
 * @throws {TypeError} - if an intermediate property is not settable
 *
 * @privateRemarks
 * The intersection between Path<T, P>  and string is necessary for TypeScript to successfully narrow down the type of P based on the user-provided path input.
 * Without the intersection, the path would just be of type Path<T, P> and PathValue would be a union of all possible return types.
 * By using the intersection, TypeScript is forced to apply the Path constraints and infer the type from the provided user input.
 */
function setByPath<
  T extends SearchableObject,
  P extends Path<T, P, SetByPathConfig>,
  V extends SetPathValue<T, P>,
>(object: T, path: P & string, value: V): void {
  const pathArray = path.split('.')
  // pathArray will never be empty
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastKey = pathArray.pop()!

  const parentObject = pathArray.reduce<unknown>((current, pathPart) => {

    if (!isValidObjectAlongPath(current)) {
      throwAssignmentError(current, pathPart)
    }

    if ((current as SafeObject)[pathPart] === undefined || (current as SafeObject)[pathPart] === null) {
      return (current as SafeObject)[pathPart] // we return the part here to later throw an error with a better error message
    }

    if (!hasOwnProperty.call(current, pathPart)) {
      throwAssignmentError(current, pathPart)
    }

    return (current as SafeObject)[pathPart]
  }, object)

  if (parentObject === null || parentObject === undefined) {
    throwAssignmentError(parentObject, lastKey)
  }

  ;(parentObject as SafeObject)[lastKey] = value
}

export type { Path, PathValue, GetPathValue, SetPathValue, SearchableObject }

export { getByPath, setByPath }
