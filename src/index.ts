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

// check if a type is null or undefined
type IsNullableOrUndefineable<T> = null extends T ? true : undefined extends T ? true : false

// Removes all possible index signatures from a type
type FilterIndexSignatureType<T> = string extends T
  ? never
  : number extends T
    ? never
    : symbol extends T
      ? never
      : T

// Remove the index signature from a type
type RemoveIndexSignature<T> = {
  [K in keyof T as FilterIndexSignatureType<K>]: T[K]
}

// check if a type has an index signature
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

// check if a type is an array
type IsArray<T> = T extends readonly any[] ? true : false

// check if a array is empty
type ArrayIsReadonlyArray<T> = T extends any[] ? false : true

// Get the type of an array element
type GetArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * check if a type is any
 * @link https://stackoverflow.com/a/49928360/1490091
 */
type IsAny<T> = 0 extends 1 & T ? true : false

// check if a type is never
type IsNever<T> = [T] extends [never] ? true : false

/**
 * check if a type is unknown
 * @link https://github.com/sindresorhus/type-fest
 */
type IsUnknown<T> =
  IsNever<T> extends true ? false : IsAny<T> extends true ? false : unknown extends T ? true : false

// check if a type is a primitive
type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | undefined | null
  ? true
  : false

// remove null and undefined from a type
type ExcludeNullUndefined<T> = Exclude<T, null | undefined>

// check if a type is an empty array
type IsEmptyArray<T> = T extends readonly [] ? true : false

// check if a type is a tuple
type IsTuple<T> = T extends readonly [any, ...any[]] ? true : false

// get the length of a tuple
type TupleLength<T> = T extends { length: infer L } ? (L extends number ? L : never) : never

// get the type of tuple element
type TupleElement<T, N> = N extends keyof T ? T[N] : never

// remove readonly from members of a record
type Writeable<T> = {
  -readonly [K in keyof T]: T[K]
}

// remove readonly properties
type RemoveReadonlyProperties<T> = {
  [K in keyof T as IsEqual<{ [k in K]: T[K] }, { readonly [k in K]: T[K] }> extends true
    ? never
    : K]: T[K]
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
type GetObjectPaths<T, DepthCarry extends unknown[], Config extends PathConfig> =
  | (Config['onlyWriteable'] extends true
      ? RemoveInvalidDotPathKeys<keyof RemoveReadonlyProperties<T>>
      : RemoveInvalidDotPathKeys<keyof T>)
  | (keyof T extends infer K
      ? K extends keyof T
        ? `${RemoveInvalidDotPathKeys<K>}.${TraversalGate<T[K], DepthCarry, Config>}`
        : never
      : never)

// get all possible paths of an array
type GetArrayPaths<T, DepthCarry extends unknown[], Config extends PathConfig> =
  | (Config['onlyWriteable'] extends true
      ? ArrayIsReadonlyArray<T> extends true
        ? never
        : number | `${number}`
      : number | `${number}`)
  | `${number}.${TraversalGate<GetArrayElement<T>, DepthCarry, Config>}`

// get all possible paths of a tuple
type GetTuplePaths<T, DepthCarry extends unknown[], Config extends PathConfig> =
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
type PathConfig = {
  depth: number
  onlyWriteable: boolean
}

// Default configuration
type DefaultPathConfig = {
  depth: 4
  onlyWriteable: false
}

type MergeWithDefaultPathConfig<T extends Partial<PathConfig>> = {
  [K in keyof PathConfig]: T[K] extends PathConfig[K] ? T[K] : DefaultPathConfig[K]
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
type TraversalStep<T, DepthCarry extends unknown[], Config extends PathConfig> =
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
type TraversalGate<T, DepthCarry extends unknown[], Config extends PathConfig> = T extends T // spread the union if it is one
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
type SimplePath<T, Config extends PathConfig> = TraversalGate<
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
type PathWithOffset<T, Config extends PathConfig, Offset extends string | number> =
  IsAny<Offset> extends true
    ? SimplePath<T, Config>
    : IsNever<Offset> extends true
      ? SimplePath<T, Config>
      : Offset extends `${string}.${string}`
        ? BeforeLast<Offset, '.'> extends infer H
          ? H extends string | number
            ? PathValue<T, H> extends infer V
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
  Config extends PathConfig,
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
  Config extends Partial<PathConfig> = object,
> = CircularConstraintPathHelper<T, MergeWithDefaultPathConfig<Config>, [Offset]>

/* -------------------------------------------------------------------------- */
/*                                 Path Value                                 */
/* -------------------------------------------------------------------------- */

type ValueTraversalStep<T, P, DepthCarry extends unknown[]> =
  IsAny<T> extends true
    ? any
    : IsUnknown<T> extends true
      ? unknown
      : IsNullableOrUndefineable<T> extends true
        ? ValueTraversalGate<ExcludeNullUndefined<T>, P, DepthCarry> | undefined
        : IsTuple<T> extends true
          ? P extends `${infer H extends number}.${infer R}`
            ? ValueTraversalGate<TupleElement<T, H>, R, DepthCarry>
            : P extends `${infer K extends number}`
              ? TupleElement<T, K>
              : undefined
          : IsArray<T> extends true
            ? P extends `${infer _H extends number}.${infer R}`
              ? ValueTraversalGate<GetArrayElement<T>, R, DepthCarry> | undefined
              : P extends `${infer _K extends number}`
                ? GetArrayElement<T> | undefined
                : undefined
            : P extends `${infer H}.${infer R}`
              ? H extends keyof T
                ?
                    | ValueTraversalGate<T[H], R, DepthCarry>
                    | (HasIndexSignature<T> extends true ? undefined : never)
                : undefined
              : P extends keyof T
                ? T[P] | (HasIndexSignature<T> extends true ? undefined : never)
                : undefined

type ValueTraversalGate<T, P, DepthCarry extends unknown[]> =
  TupleLength<DepthCarry> extends 0
    ? unknown
    : T extends T
      ? ValueTraversalStep<Writeable<T>, P, MinusOne<DepthCarry>>
      : never

type PathValue<T, P extends string | number, Depth extends number = 40> = P extends ''
  ? T
  : ValueTraversalGate<T, `${P}`, BuildTuple<Depth>>

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
): PathValue<T, P> {
  if (path === '') {
    return object as PathValue<T, P>
  }

  const pathArray = path.split('.')

  return pathArray.reduce((current: unknown, pathPart) => {
    if (!isValidObjectAlongPath(current) || !hasOwnProperty.call(current, pathPart)) {
      return undefined
    }

    return (current as SafeObject)[pathPart]
  }, object) as PathValue<T, P>
}

function throwAssignmentError(current: unknown, path: string): never {
  const type = current === null ? 'null' : typeof current
  throw new TypeError(`Cannot create property '${path}' on ${type}`)
}

type SetPathValue<T, P extends string | number, Depth extends number = 40> = PathValue<T, P, Depth>

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
  P extends Path<T, P, { onlyWriteable: true }>,
  V extends SetPathValue<T, P>,
>(object: T, path: P & string, value: V): void {
  const pathArray = path.split('.')
  // pathArray will never be empty
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastKey = pathArray.pop()!

  const parentObject = pathArray.reduce<unknown>((current, pathPart) => {
    if (!isValidObjectAlongPath(current) || !hasOwnProperty.call(current, pathPart)) {
      throwAssignmentError(current, pathPart)
    }

    return (current as SafeObject)[pathPart]
  }, object)

  if (!isValidObjectAlongPath(parentObject)) {
    throwAssignmentError(parentObject, lastKey)
  }

  ;(parentObject as SafeObject)[lastKey] = value
}

export type { Path, PathValue, SetPathValue, SearchableObject }

export { getByPath, setByPath }
