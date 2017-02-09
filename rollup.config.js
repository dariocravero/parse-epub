const pkg = require('./package.json');
const external = Object.keys(pkg.devDependencies).concat(Object.keys(pkg.dependencies));

export default {
  dest: 'lib.js',
  entry: 'index.js',
  format: 'cjs',
  external,
};
