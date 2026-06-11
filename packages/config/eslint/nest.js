const base = require("./base");

module.exports = Object.assign({}, base, {
  env: Object.assign({}, base.env, { node: true }),
  extends: (base.extends || []).concat([]),
  rules: Object.assign({}, base.rules, {}),
});
