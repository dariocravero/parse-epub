import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import npm from 'rollup-plugin-npm';

export default {
  dest: 'playground/app-bundle.js',
  entry: 'playground/app.js',
  format: 'cjs',
  moduleName: 'parse-epub',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: [
        "external-helpers",
        "transform-async-to-generator",
        "transform-es2015-destructuring",
        "transform-export-extensions",
        "transform-object-rest-spread",
        "transform-es2015-parameters"
      ],
      runtimeHelpers: true
    }),
    commonjs(),
    npm({
      jsnext: true,
      main: true
    })
  ]
};
