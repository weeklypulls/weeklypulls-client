const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './client/index.html',
  filename: 'index.html',
  inject: 'body',
});

module.exports = {
  entry: [
    'babel-polyfill',
    './client/index.js',
  ],
  devtool: "#inline-source-map",
  devServer: {
    host: '0.0.0.0',
    port: 8080,
  },
  output: {
    path: path.resolve('dist'),
    // below line only works for webpack 1.0
    // path: './dist',
    filename: 'index_bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
  plugins: [HtmlWebpackPluginConfig],
};
