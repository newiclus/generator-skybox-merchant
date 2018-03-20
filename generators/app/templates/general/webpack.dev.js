const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
});