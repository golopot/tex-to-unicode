module.exports = {
  entry: `${__dirname}/../lib/index.js`,
  output: {
    filename: 'tex-to-unicode.js',
    library: 'TexToUnicode',
    path: `${__dirname}/../docs/dist`,
  },
  mode: 'none',
};
