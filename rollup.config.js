import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
 
const packageJson = require('./package.json');
const PROD = !!process.env.CI

export default {
  input: 'src/index.ts',
  context: 'globalThis',
  external: ['@decentraland','decentraland-ecs'],
  output: [
    {
      file: packageJson.main,
      format: 'amd',
      amd: {
        id: packageJson.name
      },
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    typescript({ tsconfig: './tsconfig.json', sourceMap: false }),
    commonjs({
      exclude: 'node_modules',
      ignoreGlobal: true,
    }),
    PROD && terser({ format: { comments: false } }),
  ],
};