# Dot Diver 🌊🔍

A lightweight, powerful, dependency-free and heavily over engineered TypeScript utility library providing utility types and functions to work with object paths in dot notation.

Dot notation is a popular and convenient way to access deeply nested properties in objects. With Dot Diver, you can safely work with object paths in TypeScript projects, ensuring complete type safety and avoiding runtime errors.

Example:

```typescript
import { getByPath } from '@clickbar/dot-diver'

const object = {
  a: 'Hello world',
}

const result = getByPath(object, 'a') // result is 'Hello world'
```

<br>

## 🌟 Features

- 🎯 Works with arrays, tuples, and objects
- 🛡️ Works with readonly properties
- ✅ Tests included
- 🌀 Works with cyclic dependencies in types
- 🚫 No dependencies
- 🪶 Tiny footprint

<br>
<br>

## 📦 Installation

Install the package using your favorite package manager:

npm

```sh
npm install -D @clickbar/dot-diver
```

yarn

```sh
yarn add -D @clickbar/dot-diver
```

pnpm

```sh
pnpm install -D @clickbar/dot-diver
```

<br>
<br>

## 🚀 Usage

### 🔎 `getByPath` and 🔏 `setByPath`

<br>

```ts
import { getByPath, setByPath } from '@clickbar/dot-diver'

// Define a sample object with nested properties
const object = {
  a: 'hello',
  b: {
    c: 42,
    d: {
      e: 'world',
    },
  },
  f: [{ g: 'array-item-1' }, { g: 'array-item-2' }],
}

// Example 1: Get a value by path
const value1 = getByPath(object, 'a') // Output: 'hello'
console.log(value1)

const value2 = getByPath(object, 'b.c') // Output: 42
console.log(value2)

const value3 = getByPath(object, 'b.d.e') // Output: 'world'
console.log(value3)

const value4 = getByPath(object, 'f.0') // Output: { g: 'array-item-1' }
console.log(value4)

const value5 = getByPath(object, 'f.1.g') // Output: 'array-item-2'
console.log(value5)

// Example 2: Set a value by path
setByPath(object, 'a', 'new hello')
console.log(object.a) // Output: 'new hello'

setByPath(object, 'b.c', 100)
console.log(object.b.c) // Output: 100

setByPath(object, 'b.d.e', 'new world')
console.log(object.b.d.e) // Output: 'new world'

setByPath(object, 'f.0', { g: 'new array-item-1' })
console.log(object.f[0]) // Output: { g: 'new array-item-1' }

setByPath(object, 'f.1.g', 'new array-item-2')
console.log(object.f[1].g) // Output: 'new array-item-2'
```

> [!NOTE]
> At the moment, we can not support object properties having a '.' in their name, since this would conflict with the dot notation traversal.

<br>
<br>

### 🛣️ Path and 🔖 GetPathValue

<br>

```typescript
import type { Path, GetPathValue } from '@clickbar/dot-diver'

// Define a sample object type with nested properties
type MyObjectType = {
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

// Example 2: Using the GetPathValue type
type ValueAtPathA = GetPathValue<MyObjectType, 'a'> // Output: string
type ValueAtPathB_C = GetPathValue<MyObjectType, 'b.c'> // Output: number
type ValueAtPathB_D_E = GetPathValue<MyObjectType, 'b.d.e'> // Output: boolean
type ValueAtPathF_0 = GetPathValue<MyObjectType, 'f.0'> // Output: { g: string }
type ValueAtPathF_0_G = GetPathValue<MyObjectType, 'f.0.g'> // Output: string
```

<br>
<br>

### 🔄 Objects with cyclic dependency

<br>

```typescript
import type { Path, GetPathValue } from '@clickbar/dot-diver'

// Define an object type with nested properties and a cyclic dependency
type Node = {
  id: number
  label: string
  parent: Node
  children: Node[]
}

// Example 1: Using the Path type with the default depth limit
type NodePathsDepth2 = Path<Node> // Depth limit of 2

// NodePathsDepth2 will be a union type representing all valid paths in dot notation up to a depth of 2:
// 'id' | 'label' | 'parent' | 'children' | 'parent.id' | 'parent.label' | 'parent.parent' | 'parent.children' | `parent.parent.${any}` | `parent.children.${any}` | `children.${number}` | `children.${number}.${any}`

// Example 2: Using the Path type with a custom depth limit
type NodePathsDepth3 = Path<Node, never, { depth: 3; onlyWritable: false }> // Depth limit of 3

// With a depth limit of 3, NodePathsDepth3 will be a union type representing all valid paths in dot notation up to a depth of 3:
// 'id' | 'label' | 'parent' | 'children'
// | 'parent.id' | 'parent.label' | 'parent.parent' | 'parent.children' | `parent.parent.parent'
// | `parent.parent.parent' | 'parent.parent.children' | ... etc.
```

The second parameter is an `offset`. You can provide a valid path to start the autocompletion from there.\
This is used in `getByPath` and `setByPath` to provide autocompletion for the next levels, starting from the current path.
When using `getByPath` and `setByPath`, the `Depth` parameter is the lookahead depth and not the max depth.

The default depth is currently **3**.

<br>
<br>

### ⚙️ Customizing the Depth Lookahead Limit

You can customize the set and get functions, by implementing your own variant and using the provided types.\

Here is an example where we customize the lookahead depth to 5:

<br>

```typescript
import { getByPath, setByPath } from '@clickbar/dot-diver'

import type { Path, SearchableObject, GetPathValue, SetPathValue } from '@clickbar/dot-diver'

function getByPathDepth5<T extends SearchableObject, P extends Path<T, P, { depth: 5 }> & string>(
  object: T,
  path: P,
): GetPathValue<T, P> {
  return getByPath(object, path) as GetPathValue<T, P>
}

function setByPathDepth5<
  T extends SearchableObject,
  P extends Path<T, P, { onlyWriteable: true; depth: 5 }> & string,
>(object: T, path: P, value: SetPathValue<T, P>): void {
  setByPath(object, path, value as SetPathValue<T, P>)
}

export { getByPathDepth5 as getByPath, setByPathDepth5 as setByPath }
```

The intersection between `Path<T, P, { depth: 5 }>` and `string` is necessary for TypeScript to successfully narrow down the type of `P` based on the user-provided `path` input.
Without the intersection, the `path` would just be of type `Path<T, P, { depth: 5 }>` and `PathValueEntry` would be a union of all possible return types.
By using the intersection, TypeScript is forced to apply the `Path` constraints and infer the type from the provided user input.

<br>
<br>

## ❓ FAQ

### ❗ Why are my paths truncated in a object with index signature?

Paths get truncated, if they are unioned with a string. E.g. `keyof T | string`.\
This should only happen in rare cases for objects looking like this:

```typescript
type TestType = {
  a: string
  b: string
  [key: string]: string
}
```

If your object has nested properties, for example looking like this:

```typescript
type TestType = {
  a: string
  b: {
    c: string
  }
  [key: string]: string
}
```

You will get autocompletion again, as soon as you typed the path to the nested object, e.g. `b.`.

<br>

### ❗ Why are my paths truncated inside an array?

Your paths are not truncated. TypeScript will still validate them.
Some IDEs have problems with displaying `children.${number}` paths.
If you can, define the array as an tuple. This will include all paths in the autocompletion.

<br>

### ❗ I get the error "Type instantiation is excessively deep and possibly infinite.ts(2589)"

This happens if TypeScript reaches its maximum depth limit. This library should prevent this, but it can still happen if a object has a lot of cyclic dependencies.\
For example:

```typescript
type TestType = {
  a: TestType
  b: [TestType]
  c: TestType[]
  d: {
    e: TestType
  }
  f: TestType
}
```

You can try to decrease the lookahead depth of the autocompletion by reimplementing the `getByPath` and `setByPath` functions.
See [this section](#%EF%B8%8F-customizing-the-depth-lookahead-limit).

<br>

## 👨‍💻 Contributing

If you would like to contribute to Dot Diver, feel free to fork the repository, make changes, and submit a pull request. We appreciate any help and feedback.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

<br>

## 🔒 Security Vulnerabilities

Please see [SECURITY](SECURITY.md) for details.

<br>

## 📄 License

Dot Diver is licensed under the [MIT License](LICENSE.md).

<br>

🎉 Happy diving! 🌊
