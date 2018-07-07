module.exports = {
  entry: './main.js',
  output: {
    filename : '[name].bundle.js',
    path : __dirname,
  },
  devtool: 'source-map',
  plugins: [],
  mode: 'production',
}
