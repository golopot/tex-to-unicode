const CopyWebpackPlugin = require('copy-webpack-plugin');

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
  ],
  mode: 'production',
};
