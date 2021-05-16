/* eslint-disable no-undef */
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { chrome: "90", firefox: "88" } }],
    "@babel/preset-typescript",
  ],
};
