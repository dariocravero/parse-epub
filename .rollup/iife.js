import babel from 'rollup-plugin-babel';

export default {
  dest: 'playground/media-overlay.js',
  entry: 'index.js',
  format: 'iife',
  moduleName: 'MediaOverlay',
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
