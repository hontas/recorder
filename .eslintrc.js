module.exports = {
  extends: ['eslint:recommended', 'airbnb-base', 'prettier'],
  plugins: ['import', 'react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'import/prefer-default-export': [0],
    'no-use-before-define': ['error', { functions: false }],
    'no-unused-vars': [2, { varsIgnorePattern: 'h' }],
    'react/jsx-uses-vars': 2
  },
  env: {
    browser: true
  }
};
