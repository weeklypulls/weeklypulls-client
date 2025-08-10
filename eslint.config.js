// ESLint flat config for CRA-era React + TypeScript
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: ["build/**", "node_modules/**", "coverage/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
      prettier,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...(tseslint.configs.recommendedTypeChecked ?? [])[0]?.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // import plugin base rules
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      // a11y
      ...jsxA11y.configs.recommended.rules,
      // TS/React relaxations
      // Always disable base no-unused-vars in TS projects; use @typescript-eslint/no-unused-vars
      "no-unused-vars": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^(?:_|autoBindMethods|inject|observer|observable|action)$",
          ignoreRestSiblings: true,
        },
      ],
      // Prettier integration
      "prettier/prettier": "warn",
    },
  },
];
