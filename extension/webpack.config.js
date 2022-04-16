const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPrettierPlugin = require('webpack-prettier-plugin');

module.exports = {
  entry: './main.js',
  output: {
    filename: '[name].bundle.js',
    path: `${__dirname}/dist`,
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{from: 'public'}],
    }),
    new WebpackPrettierPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2018,
          compress: false,
          mangle: false,
        },
      }),
    ],
  },
  mode: 'none',
};
