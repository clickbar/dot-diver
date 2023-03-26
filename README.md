# Dot Diver 🌊🔍

A lightweight, powerful, and dependency-free TypeScript utility library that provides types and functions to work with object paths in dot notation. Dive into your objects with ease, while maintaining comprehensive type safety! 🎉

Dot notation is a popular and convenient way to access deeply nested properties in objects. With Dot Diver, you can safely work with object paths in TypeScript projects, ensuring type correctness and productivity!

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

<br>
<br>

### 🛣️ Path and 🔖 PathValue

<br>

```typescript
import type { Path, PathValue } from '@clickbar/dot-diver'

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

// Example 2: Using the PathValue type
type ValueAtPathA = PathValue<MyObjectType, 'a'> // Output: string
type ValueAtPathB_C = PathValue<MyObjectType, 'b.c'> // Output: number
type ValueAtPathB_D_E = PathValue<MyObjectType, 'b.d.e'> // Output: boolean
type ValueAtPathF_0 = PathValue<MyObjectType, 'f.0'> // Output: { g: string }
type ValueAtPathF_0_G = PathValue<MyObjectType, 'f.0.g'> // Output: string
```

<br>
<br>

### 🔄 Objects with cyclic dependency

<br>

```typescript
import type { Path, PathValue } from '@clickbar/dot-diver'

// Define an object type with nested properties and a cyclic dependency
type Node = {
  id: number
  label: string
  parent: Node
  children: Node[]
}

// Example 1: Using the Path type with a Depth limit
type NodePathsDepth2 = Path<Node, 2> // Depth limit of 2

// NodePathsDepth2 will be a union type representing all valid paths in dot notation up to a depth of 3:
// 'id' | 'label' | 'parent' | 'children' | 'parent.id' | 'parent.label' | 'parent.parent' | 'parent.children' | `parent.parent.${any}` | `parent.children.${any}` | `children.${number}` | `children.${number}.${any}`

// Example 2: Using the PathValue type with a Depth limit
type ValueAtPathParent_Id = PathValue<Node, 'parent.id', 3> // Output: number
type ValueAtPathChildren_0_Label = PathValue<Node, 'children.0.label', 3> // Output: string | undefined
type ValueAtPathParent_Parent_Parent = PathValue<Node, 'parent.parent.parent.parent', 3> // Output: unknown (due to the depth limit)
```

The default depth is currently **10**.\
At the moment, it is not possible to customize it when using the provided `getByPath` and `setByPath` functions.
This is further explained in this [issue](https://github.com/clickbar/dot-diver/issues/1).

<br>
<br>

### ⚙️ Customizing the Depth Limit

You can still customize it, by implementing your own functions, which just calls ours.
Example:

<br>

```typescript
import { getByPath, setByPath } from '@clickbar/dot-diver'

import type { Path, SearchableObject, PathValue } from '@clickbar/dot-diver'

function getByPathDepth10<T extends SearchableObject, P extends Path<T, 5> & string>(
  object: T,
  path: P
): PathValue<T, P, 5> {
  return getByPath(object, path) as PathValue<T, P, 5>
}

function setByPathDepth10<
  T extends SearchableObject,
  P extends Path<T, 5> & string,
  V extends PathValue<T, P, 5>
>(object: T, path: P, value: V): void {
  setByPath(object, path, value as PathValue<T, P, 10>)
}

export { getByPathDepth10 as getByPath, setByPathDepth10 as setByPath }
```

The intersection between `Path<T, 5>` and `string` is necessary for TypeScript to successfully narrow down the type of `P` based on the user-provided `path` input.
Without the intersection, the `path` would just be of type `Path<T, 10>` and `PathValueEntry` would be a union of all possible return types.
By using the intersection, TypeScript is forced to apply the `Path` constraints and infer the type from the provided user input.

<br>
<br>

## ❓ FAQ

### ❗ Why are my paths truncated in a object with index signature?

See this [issue](https://github.com/clickbar/dot-diver/issues/2).

<br>

### ❗ Why are my paths truncated inside an array?

Your paths are not truncated. Typescript will still validate them.
Some IDEs have problems with displaying `children.${number}` paths.
If you can, define the array as an tuple. This will include all paths in the auto completion.

<br>

### ❗ I get the error "Type instantiation is excessively deep and possibly infinite.ts(2589)"

This happens if typescript reaches its maximum depth limit. This library should prevent this, but it can still happen if a object has a lot of cyclic dependencies.\
For example:

```typescript
type TestType = {
  a: TestType
  b: [TestType]
  c: TestType[]
  d: {
    e: TestType
  }
  f: TestType2
}
```

You can try to decrease the depth limit of the auto completion by reimplementing the `getByPath` and `setByPath` functions.
See [this section](#%EF%B8%8F-customizing-the-depth-limit) for customizing the depth limit.

<br>

## 👨‍💻 Contributing

If you would like to contribute to Dot Diver, feel free to fork the repository, make changes, and submit a pull request. We appreciate any help and feedback.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

<br>

## 📄 License

Dot Diver is licensed under the [MIT License](LICENSE.md).

<br>

🎉 Happy diving! 🌊
