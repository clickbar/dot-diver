# Changelog

All notable changes to **dot-diver** will be documented here. Inspired by [keep a changelog](https://keepachangelog.com/en/1.0.0/)

## Unreleased

- Fixed reactivity issues caused by hasOwnProperty check

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
