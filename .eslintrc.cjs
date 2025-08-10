// Legacy ESLint config for tools that still look for .eslintrc.*
// Project uses eslint.config.js (flat config) for CLI linting.
// Keep this minimal to avoid CRA/webpack plugin crashes under ESM package type.
module.exports = {
  root: true,
  extends: [],
};
