module.exports = {
  webpack: function override(config, env) {
    config.module.rules.push({
      test: /cvizzu\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
    });

    return config;
  },
};
