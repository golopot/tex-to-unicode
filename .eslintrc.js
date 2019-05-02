module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    webextensions: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    eqeqeq: 2,
    'no-cond-assign': 0,
    'no-console': 0,
    'no-unused-expressions': 2,
    'prefer-template': 2,
    'prefer-const': 2,
    'prefer-destructuring': 2,
  },
};
