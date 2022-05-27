import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { dependencies } from './package.json'

const external = Object.keys(dependencies || '')
const globals = external.reduce((prev, current) => {
  const newPrev = prev
  newPrev[current] = current
  return newPrev
}, {})

export default {
  input: './index.js',
  output: [
    {
      file: './dist/index.js',
      banner: '#!/usr/bin/env node',
      name: 'index',
      format: 'es',
      globals,
    },
    {
      file: './dist/index.cjs',
      banner: '#!/usr/bin/env node',
      name: 'index',
      format: 'cjs',
      globals,
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    resolve(),
    commonjs(),
    json(),
  ],
  external,
}
