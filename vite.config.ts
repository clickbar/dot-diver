/// <reference types="node" />

import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DotDiver',
      fileName: 'index',
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/'],
    }),
  ],
})
