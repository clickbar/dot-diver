# Changelog

All notable changes to **dot-diver** will be documented here. Inspired by [keep a changelog](https://keepachangelog.com/en/1.0.0/)

## [2.0.0](https://github.com/clickbar/dot-diver/tree/2.0.0) (2024-08-18)

## Features

Support paths up to a depth of 40 (limited by TypeScript's recursion depth) by utilizing cyclic constraints to only lookup up
the next 3 (default) levels. This should
heavily improve performance and reduce the amount of generated types.

## Fixes

- partially fixes <https://github.com/clickbar/dot-diver/issues/2>
- <https://github.com/clickbar/dot-diver/issues/3>
- <https://github.com/clickbar/dot-diver/issues/4>
- <https://github.com/clickbar/dot-diver/issues/5>
- <https://github.com/clickbar/dot-diver/issues/30>
- <https://github.com/clickbar/dot-diver/issues/34>

### Breaking Changes

In general the `depth` limit of `Path` is no longer the max depth, but instead a 'lookahead' depth. E.g. if you have a depth limit of 3,
and are currently (while typing) at a depth of 2, the paths for the next 3 levels will be shown in autocompletion. You can no longer
constrain the max depth of the path, but only the lookahead depth. If this is a problem for you, please open an issue.

#### Value of Array Member, Optional Properties and Union Types

In 1.0.0 you received the full type for nested unions.

```typescript
type A = { a: number | { nested: string } }

type NestedType = PathValue<A, 'a.nested'> // string
```

This is incorrect behavior, because `a` could also be a number and not an object with a `nested` property. This is now fixed.

```PathValue``` was split into two different types:

- ```GetPathValue``` for reading values
- ```SetPathValue``` for setting values

the resulting types differ when accessing values in an object or setting them.

```typescript
type A = {
  a: number | { nested: string }
  b: Record<string, number>
  c: string[]
  d?: { nested: string }
}

type NestedType1 = GetPathValue<A, 'a.nested'> // string | undefined
type NestedType2 = GetPathValue<A, 'b.key'> // number | undefined
type NestedType3 = GetPathValue<A, 'c.5'> // string | undefined
type NestedType4 = GetPathValue<A, 'd.nested'> // string | undefined

type NestedType5 = SetPathValue<A, 'a.nested', string> // string
type NestedType6 = SetPathValue<A, 'b.key', number> // number
type NestedType7 = SetPathValue<A, 'c.5', string> // string
type NestedType8 = SetPathValue<A, 'd.nested', string> // string
```

These type are used by their respective functions `getByPath` and `setByPath` and should more accurately represent the types of accessed values but can potentially break old code.

#### Custom Implementation

Implementation of custom `getByPath` and `setByPath` functions need to be updated for the new types.
If you implemented them to change the depth limit you might not need them anymore, as the (max) depth is now 40 (limited by TypeScript's recursion limit).
You still want to keep them, if you want to change the shown paths in autocompletion or have other use cases.
You only need to change the typing.

Old:

```typescript
function getByPathDepth5<T extends SearchableObject, P extends Path<T, 5> & string>(
  object: T,
  path: P,
): PathValue<T, P, 5> {
  return getByPath(object, path) as PathValue<T, P, 5>
}

function setByPathDepth5<
  T extends SearchableObject,
  P extends Path<T, 5> & string,
  V extends PathValue<T, P, 5>,
>(object: T, path: P, value: V): void {
  setByPath(object, path, value as PathValue<T, P>)
}
```

New:

```typescript
function getByPathDepth5<T extends SearchableObject, P extends Path<T, P, { depth: 5 }> & string>(
  object: T,
  path: P,
): GetPathValue<T, P> {
  return getByPath(object, path) as GetPathValue<T, P>
}

function setByPathDepth5<
  T extends SearchableObject,
  P extends Path<T, P, { onlyWriteable: true; depth: 5 }> & string,
  V extends SetPathValue<T, P>,
>(object: T, path: P, value: V): void {
  setByPath(object, path, value as SetPathValue<T, P>)
}
```

## [1.0.6](https://github.com/clickbar/dot-diver/tree/1.0.6) (2024-03-25)

- Fixed breaking change introduced in the type of SearchableObject

## [1.0.5](https://github.com/clickbar/dot-diver/tree/1.0.5) (2024-03-21)

- Fixed getByPath throws if accessing a null value
- Fixed setByPath does not throw when assigning to non objects in browsers

## [1.0.4](https://github.com/clickbar/dot-diver/tree/1.0.4) (2023-11-07)

- Fixed wrong type transformation via vite-dts-plugin (see #15)
- Fixed wrong cjs export filename
- Fixed order of types export to be the first export
- Enabled rollup of Typescript declaration files

## [1.0.3](https://github.com/clickbar/dot-diver/tree/1.0.3) (2023-11-03)

- Rerelease with fixed release pipeline 😅

## [1.0.2](https://github.com/clickbar/dot-diver/tree/1.0.2) (2023-11-02)

- Updated dependencies
- Formatted code with new lint rules
- Fixed testcase for new TypeScript behavior
- Added guards against prototype pollution, thanks to @d3ng03 (<https://github.com/clickbar/dot-diver/security/advisories/GHSA-9w5f-mw3p-pj47>)
- Added provenance for the published package (See <https://docs.npmjs.com/generating-provenance-statements>)

## [1.0.1](https://github.com/clickbar/dot-diver/tree/1.0.1) (2023-03-26)

- Rerelease with content 😅

## [1.0.0](https://github.com/clickbar/dot-diver/tree/1.0.0) (2023-03-26)

- Initial Release 🎉
