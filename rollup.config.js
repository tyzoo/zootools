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
  external: [
    /@dcl\//, 
    /@decentraland\//, 
    '@decentraland/Identity',
    '@decentraland/EnvironmentAPI',
    '@decentraland/web3-provider',
    '@decentraland/RestrictedActions',
    '@decentraland/SignedFetch',
    '@decentraland/EthereumController',
    'decentraland-ecs',
    'dcldash',
  ],
  output: [
    {
      file: packageJson.main,
      format: 'amd',
      sourcemap: true,
      amd: {
        id: packageJson.name
      },
      plugins: [],
    },
    {
      file: packageJson.main,
      format: 'es',
      sourcemap: true,
      file: 'dist/bundle.js',
      plugins: [],
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
    PROD && terser({
      mangle: {
        toplevel: false,
        module: false,
        eval: true,
        keep_classnames: true,
        keep_fnames: true,
        reserved: ['global', 'globalThis', 'define']
      },
      compress: {
        passes: 2
      },
      format: {
        ecma: 5,
        comments: /^!/,
        beautify: false
      },
      toplevel: false
      // output: { quote_style: 1 },
    })
  ],
};