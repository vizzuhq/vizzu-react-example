module.exports = {
  webpack: function override(config, env) {
    config.module.rules.push({
      test: /\.js$/,
      loader: require.resolve("@open-wc/webpack-import-meta-loader"),
    });

    config.module.rules.push({
      test: /\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
    });

    return config;
  },
};
