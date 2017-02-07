const babel = require('rollup-plugin-babel');

module.exports = {
  dest: 'cjs.js',
  entry: 'index.js',
  format: 'cjs',
  moduleName: 'parse-epub',
  external: [
    'regenerator-runtime'
  ],
  plugins: [
    {
      resolveId(importee) {
        if (/regenerator$/.test(importee)) {
          return 'regenerator-runtime'
        }
      }
    },
    babel({
      exclude: 'node_modules/**',
      presets: [
        require.resolve('babel-preset-react-app-rollup')
      ]
    })
  ]
};
