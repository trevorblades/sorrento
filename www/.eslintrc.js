module.exports = {
  extends: [
    "plugin:@trevorblades/react",
    "plugin:@trevorblades/typescript",
    "plugin:yml/recommended",
    "plugin:prettier/recommended",
    "plugin:@next/next/recommended",
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
