module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    sourceType: "module",
    project: undefined,
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: { version: "detect" },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "jsx-a11y", "prettier"],
  extends: [],
  rules: {
    // TypeScript/React common adjustments for legacy codebase
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // Keep imports tidy but lenient
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    // Enforce Prettier formatting via ESLint
    "prettier/prettier": ["warn"],
  },
};
