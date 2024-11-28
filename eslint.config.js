const globals = require("globals");

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];

// Export the configuration using CommonJS syntax
module.exports = config;
