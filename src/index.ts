
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

type GetValidIndexSignature<T> = Exclude<keyof T, symbol> extends infer K ? K extends string | number ? K : never : never


// Keys have to be strings or number and can't contain a dot since we won't be able to differ between and key with a dot and a nested key
type RemoveInvalidDotPathKeys<T> = T extends symbol ? never
	: T extends number ? T
		: T extends string ? T extends `${infer _K}.${infer _R}` ? never : T
			: never

// check if a type is an array
type IsArray<T> = T extends Array<any> ? true : false

// Get the type of an array element
type GetArrayElement<T> = T extends Array<infer U> ? U : never

/**
 * check if a type is any
 * @link https://stackoverflow.com/a/49928360/1490091
 */
type IsAny<T> = 0 extends (1 & T) ? true : false

// check if a type is never
type IsNever<T> = [T] extends [never] ? true : false

/**
 * check if a type is unknown
 * @link https://github.com/sindresorhus/type-fest
 */
type IsUnknown<T> = IsNever<T> extends true ? false
	: IsAny<T> extends true ? false :
		unknown extends T ? true : false

// check if a type is a primitive
type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | undefined | null ? true : false

// remove null and undefined from a type
type ExcludeNullUndefined<T> = Exclude<T, null | undefined>

// check if a type is a tuple
type IsTuple<T> = T extends [any, ...any[]] ? true : false

// get the length of a tuple
type TupleLength<T> = T extends { length: infer L } ? L extends number ? L : never : never

// get the type of a tuple element
type TupleElement<T, N> = N extends keyof T ? T[N] : never

// get all numbers from 0 to L
type NumbersToZero<L extends number, Depth extends number> =
	Depth extends 0 ? never :
	L extends -1 ? never :
	NumbersToZero<MinusOne<L>, MinusOne<Depth>> | L

// possible recod keys
type RecordKeys = string | number | symbol

// remove readonly from members of a record
type Writeable<T> = {
	-readonly [K in keyof T]: T[K]
}

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

// get all possible paths of a tuple
type GetTuplePaths<T, Depth extends number> = NumbersToZero<MinusOne<TupleLength<T>>, Depth> extends infer R ? R extends number ? R | `${R}.${Path<TupleElement<T, R>, Depth>}` : never : never

type PathStep<T, Depth extends number> = IsAny<T> extends true ? string
	: IsUnknown<T> extends true ? never
		: IsPrimitive<T> extends true ? never
			: IsTuple<T> extends true ? GetTuplePaths<T, Depth>
			: IsArray<T> extends true ? number | GetArrayPaths<T, Depth>
				: HasIndexSignature<T> extends true ? GetValidIndexSignature<T> | GetRecordPaths<RemoveIndexSignature<T>, Depth>
					: GetRecordPaths<T, Depth>

// Final path type
type Path<T, Depth extends number = 25> = Depth extends 0 ? never : T extends T ? PathStep<Writeable<ExcludeNullUndefined<T>>, MinusOne<Depth>> : never

type PathValueStep<T, P, Depth extends number> = IsAny<T> extends true ? any
: IsUnknown<T> extends true ? unknown
: IsNullableOrUndefineable<T> extends true ? PathValueStep<ExcludeNullUndefined<T>, P, Depth> | undefined
	: IsTuple<T> extends true
		? P extends `${infer H}.${infer R}`
			? PathValueStep<TupleElement<T, H>, R, Depth>
			: TupleElement<T, P>
	: IsArray<T> extends true
		? P extends `${infer _H}.${infer R}`
			? PathValueStep<GetArrayElement<T>, R, Depth> | undefined
			: GetArrayElement<T> | undefined
		: P extends `${infer H}.${infer R}`
			? H extends keyof T ? PathValue<T[H], R, Depth> | (HasIndexSignature<T> extends true ? undefined : never)
				: never
			: P extends keyof T
				? T[P] | (HasIndexSignature<T> extends true ? undefined : never)
				: never

// nearly same function as PathValueEntry, but without constraints for P so it is easier to use in PathValueStep
type PathValue<T, P, Depth extends number = 25> = Depth extends 0 ? never : T extends T ? PathValueStep<Writeable<T>, P, Depth> : never

// final path value type
type PathValueEntry<T, P extends Path<T, Depth>, Depth extends number = 25> = PathValue<T, P, Depth>

/**
 * Retrives a value from an object by dot notation
 * 
 * @param obj - object to get value from 
 * @param path - path to value
 */
function getByPath<T extends Record<RecordKeys, unknown> | unknown[], P extends Path<T, 25>>(obj: T, path: P): PathValueEntry<T, P, 25> {
	const pathArr = (path as string).split('.')

	return pathArr.reduce((acc: any, cur) => acc?.[cur], obj) as PathValueEntry<T, P, 25>
}

function setByPath<T extends Record<RecordKeys, unknown> | unknown[], P extends Path<T, 25>, V extends PathValueEntry<T, P, 25>>(obj: T, path: P, value: V): void {
	const pathArr = (path as string).split('.')
	const lastKey = pathArr.pop()

	if (lastKey === undefined) {
		throw new Error('Path is empty')
	}

	const objToSet = pathArr.reduce((acc: any, cur) => acc?.[cur], obj)

	if (objToSet === undefined) {
		throw new Error('Path is invalid')
	}

	objToSet[lastKey] = value
}

export type { Path, PathValueEntry as PathValue }

export { getByPath, setByPath }
