
/* -------------------------------------------------------------------------- */
/*                                Utility Types                               */
/* -------------------------------------------------------------------------- */

// check if a type is null or undefined
type IsNullableOrUndefineable<T> = null extends T ? true : undefined extends T ? true : false

// Removes all possible index signatures from a type
type FilterIndexSignatureType<T> =
	string extends T ? never :
		number extends T ? never :
			symbol extends T ? never :
				T

// Remove the index signature from a type
type RemoveIndexSignature<T> = {
	[K in keyof T as FilterIndexSignatureType<K>]: T[K]
}

// check if a type has an index signature
type HasIndexSignature<T> = string extends keyof T ? true
	: number extends keyof T ? true
		: symbol extends keyof T ? true
			: false

// Keys have to be strings or number and can't contain a dot since we won't be able to differ between and key with a dot and a nested key
type RemoveInvalidDotPathKeys<T> = T extends symbol ? never
	: T extends number ? T
		: T extends string ? T extends `${infer _K}.${infer _R}` ? never : T
			: never

// check if a type is an array
type IsArray<T> = T extends Array<any> ? true : false

// Get the type of an array element
type GetArrayElement<T> = T extends Array<infer U> ? U : never

// check if a type is any
type IsAny<T> = 0 extends (1 & T) ? true : false

// check if a type is a primitive
type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | undefined | null ? true : false

// remove null and undefined from a type
type ExcludeNullUndefined<T> = Exclude<T, null | undefined>

/* -------------------------------------------------------------------------- */
/*                                 Math Types                                 */
/* -------------------------------------------------------------------------- */
// sourced from https://stackoverflow.com/a/75419300/15279490

type Length<T extends unknown[]> = T extends { length: infer L } ? L : never
type BuildTuple<L extends number, T extends unknown[] = []> = T extends { length: L }
	? T
	: BuildTuple<L, [...T, unknown]>
type MinusOne<N extends number> = BuildTuple<N> extends [...infer U, unknown] ? Length<U> : never

/* -------------------------------------------------------------------------- */
/*                                 Path Types                                 */
/* -------------------------------------------------------------------------- */

// get all possible paths of a type
type GetRecordPaths<T, Depth extends number, K extends keyof T = keyof T> = K extends keyof T ? RemoveInvalidDotPathKeys<K> | `${RemoveInvalidDotPathKeys<K>}.${Path<T[K], Depth>}` : never

// get all possible paths of an array
type GetArrayPaths<T, Depth extends number> = `${number}.${Path<GetArrayElement<T>, Depth>}`

type PathStep<T, Depth extends number> = IsAny<T> extends true ? string
	: IsPrimitive<T> extends true ? never
		: IsArray<T> extends true ? `${number}` | GetArrayPaths<T, Depth>
			: HasIndexSignature<T> extends true ? (string & Record<never, never>) | GetRecordPaths<RemoveIndexSignature<T>, Depth>
				: GetRecordPaths<T, Depth>

// Final path type
type Path<T, Depth extends number = 25> = Depth extends 0 ? never : T extends T ? PathStep<ExcludeNullUndefined<T>, MinusOne<Depth>> : never

// Without Path constraint, so we can write PathValue with less clutter
type PathValueStep<T, P> = P extends Path<T> ? PathValue<T, P> : never

// final path value type
type PathValue<T, P extends Path<T>> = IsAny<T> extends true ? any
	: IsNullableOrUndefineable<T> extends true ? PathValueStep<ExcludeNullUndefined<T>, P> | undefined
		: IsArray<T> extends true
			? P extends `${infer _H}.${infer R}`
				? PathValueStep<GetArrayElement<T>, R> | undefined
				: GetArrayElement<T> | undefined
			: P extends `${infer H}.${infer R}`
				? H extends keyof T ? PathValueStep<T[H], R> | (HasIndexSignature<T> extends true ? undefined : never)
					: never
				: P extends keyof T
					? T[P] | (HasIndexSignature<T> extends true ? undefined : never)
					: never

export type { Path, PathValue }