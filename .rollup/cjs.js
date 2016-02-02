import babel from 'rollup-plugin-babel';

export default {
  dest: 'dist/cjs.js',
  entry: 'index.js',
  format: 'cjs',
  moduleName: 'media-overlay',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: [
        "external-helpers",
        "transform-async-to-generator",
        "transform-es2015-destructuring",
        "transform-export-extensions",
        "transform-object-rest-spread"
      ],
      runtimeHelpers: true
    })
  ]
};
