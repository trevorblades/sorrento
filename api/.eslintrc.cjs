// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    "plugin:@trevorblades/node",
    "plugin:@trevorblades/typescript",
    "plugin:yml/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [
    {
      files: ["*.graphql"],
      parser: "@graphql-eslint/eslint-plugin",
      plugins: ["@graphql-eslint"],
      rules: {
        "prettier/prettier": "error",
      },
    },
  ],
};

module.exports = config;
