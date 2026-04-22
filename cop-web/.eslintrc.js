module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard', '@vue/typescript'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': [
      0,
      {
        vars: 'all',
        args: 'none'
      }
    ],
    semi: 0,
    eqeqeq: 0,
    'one-var': 0,
    camelcase: 0,
    'no-case-declarations': 0,
    'space-before-function-paren': 0,
    'vue/no-parsing-error': [2, { "x-invalid-end-tag": false }],
    '@typescript-eslint/indent': ['error', 2] 
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
};
