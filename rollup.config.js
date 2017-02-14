import buble from 'rollup-plugin-buble';

const pkg = require('./package.json');
const external = Object.keys(pkg.devDependencies).concat(Object.keys(pkg.dependencies));

export default {
  dest: 'lib.js',
  entry: 'index.js',
  format: 'cjs',
  external,
  plugins: process.env.NODE_ENV === 'production' ? [buble()] : undefined,
};
