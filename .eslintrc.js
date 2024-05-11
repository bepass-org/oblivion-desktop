module.exports = {
    extends: 'erb',
    plugins: ['@typescript-eslint'],
    rules: {
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'import/no-import-module-exports': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-nested-ternary': 'off',
        'jsx-a11y/label-has-associated-control': 'warn',
        'no-console': 'off',
        'import/prefer-default-export': 'off',
        'prefer-destructuring': 'off',
        'prettier/prettier': 'off',
        'react/jsx-no-useless-fragment': 'off',
        'react/jsx-curly-brace-presence': 'off',
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'react/button-has-type': 'off',
        'prefer-template': 'off',
        'no-param-reassign': 'off',
        'no-lonely-if': 'off',
        'no-plusplus': 'off',
        'promise/always-return': 'off',
        'class-methods-use-this': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'object-shorthand': 'off',
        'import/no-cycle': 'off',
        'promise/catch-or-return': 'off',
        'import/order': 'warn',
        'spaced-comment': 'off',
        'react/jsx-boolean-value': 'off',
        'react/require-default-props': 'off',
        'no-unneeded-ternary': 'off',
        'consistent-return': 'off',
        'no-async-promise-executor': 'off',
        'no-else-return': 'off',
        'func-names': 'off'
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    settings: {
        'import/resolver': {
            // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
            node: {},
            webpack: {
                config: require.resolve('./.erb/configs/webpack.config.eslint.ts')
            },
            typescript: {}
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        }
    }
};
