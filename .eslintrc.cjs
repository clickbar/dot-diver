/* eslint-env node */
module.exports = {
  root: true,
  extends: ['@clickbar/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'unicorn/no-array-reduce': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unnecessary-type-arguments': 'off',
  },
}
