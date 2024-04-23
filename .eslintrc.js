module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',

    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'import/no-named-default': 'off',

    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-shadow': ['error', { builtinGlobals: false }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'enumMember',
        format: ['PascalCase'],
      },
    ],

    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'vue/no-v-html': 'off',
    'vue/require-prop-types': 'off',
    'vue/one-component-per-file': 'off',
    'vue/singleline-html-element-content-newline': 'off',

    // 使用 @typescript-eslint/no-unused-vars, 否则 interface 都是 unused
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'no-param-reassign': 'off',
    'no-continue': 'off',
    'no-plusplus': 'off',
    'no-eval': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-useless-escape': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    'no-return-assign': ['error', 'except-parens'],
    'no-redeclare': 'off',
    'no-script-url': 'off',
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-alert': 'off',
    'no-restricted-globals': 'off',

    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    'object-curly-newline': 'off',
    'linebreak-style': 'off',
    camelcase: 'off',
    'lines-between-class-members': 'off',
    radix: ['error', 'as-needed'],
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
    ],
    curly: ['error', 'all'],
  },
  overrides: [
    {
      files: ['*.vue', 'shims.d.ts', 'webpack/**/*.ts', 'registry/webpack/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
}
