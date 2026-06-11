const base = require("./base");

module.exports = Object.assign({}, base, {
  env: Object.assign({}, base.env, { browser: true }),
  extends: (base.extends || []).concat([
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ]),
  settings: Object.assign({}, base.settings, { react: { version: "detect" } }),
  rules: Object.assign({}, base.rules, {}),
});
