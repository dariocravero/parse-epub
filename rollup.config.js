module.exports = {
  plugins: [
    require('rollup-plugin-babel')({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
}